import { command, query } from '$app/server';
import { pointsValues } from '$lib/assets/data';
import { supabase } from '$lib/server/supabaseClient';
import { logger } from '$lib/util/logger';
import { round2 } from '$lib/util/math';
import * as v from 'valibot';
import type { VoteStats } from './votes.schemas';

interface Vote {
  room_id: string;
  user_id: string;
  complexity?: number | null;
  effort?: number | null;
  uncertainty?: number | null;
}

export const fetchVotesAndUsersByRoomId = query(v.string(), async (roomId) => {
  const { data, error } = await supabase
    .from('votes')
    .select('complexity, effort, uncertainty, users ( id, username )')
    .eq('room_id', roomId);
  if (!data || error) {
    logger.error('Error fetching votes:', error);
    throw error;
  }
  const votes = data.map((vote) => ({
    complexity: vote.complexity,
    effort: vote.effort,
    uncertainty: vote.uncertainty,
    userid: vote.users.id,
    username: vote.users.username
  }));

  const mean: number = computeMean(votes);
  const pointValueOverMean: number | null = computePointOverMean(mean);

  const votesByUser = Object.groupBy(votes, (vote) => vote.userid);
  const recommendedValueByUser = Object.fromEntries(
    Object.entries(votesByUser).map(([userId, userVotes]) => {
      if (!userVotes || userVotes.length === 0) {
        return [userId, null];
      }

      const userMean = computeMean(userVotes);
      const userRecommendedValue = computePointOverMean(userMean);
      return [userId, userRecommendedValue];
    })
  );

  return {
    votes: votes.map((vote) => ({
      complexity: vote.complexity,
      effort: vote.effort,
      uncertainty: vote.uncertainty,
      userId: vote.userid,
      username: vote.username
    })),
    mean,
    pointValueOverMean,
    stats: {
      teamMean: mean,
      teamRecommendedValue: pointValueOverMean,
      teamMin: {
        value: recommendedValueByUser
          ? Math.min(...Object.values(recommendedValueByUser).filter((v): v is number => v !== null && !isNaN(v)))
          : null,
        usernames: votes
          .filter(
            (vote) =>
              recommendedValueByUser[vote.userid] ===
              (recommendedValueByUser
                ? Math.min(...Object.values(recommendedValueByUser).filter((v): v is number => v !== null && !isNaN(v)))
                : null)
          )
          .map((vote) => vote.username)
      },
      teamMax: {
        value: recommendedValueByUser
          ? Math.max(...Object.values(recommendedValueByUser).filter((v): v is number => v !== null && !isNaN(v)))
          : null,
        usernames: votes
          .filter(
            (vote) =>
              recommendedValueByUser[vote.userid] ===
              (recommendedValueByUser
                ? Math.max(...Object.values(recommendedValueByUser).filter((v): v is number => v !== null && !isNaN(v)))
                : null)
          )
          .map((vote) => vote.username)
      },
      complexityRecommandation: computePointOverMeanByCategory(votes, 'complexity'),
      effortRecommandation: computePointOverMeanByCategory(votes, 'effort'),
      uncertaintyRecommandation: computePointOverMeanByCategory(votes, 'uncertainty')
    } satisfies VoteStats
  };
});

const computeMean = (votes: VoteModel[]): number => {
  const nbVotes = votes
    .flatMap((vote) => {
      return Object.entries(vote)
        .filter(([key]) => key !== 'username')
        .map(([, value]) => (typeof value === 'number' ? value : null));
    })
    .filter((vote: number | null) => vote !== null && !isNaN(vote)).length;
  return round2(votes.reduce((acc, vote) => acc + (vote.complexity || 0) + (vote.effort || 0) + (vote.uncertainty || 0), 0) / nbVotes);
};

const computePointOverMean = (mean: number): number | null => {
  if (isNaN(mean)) {
    return null;
  }
  const pointValueOverMean = pointsValues.find((value) => value >= mean) ?? pointsValues[pointsValues.length - 1];
  return pointValueOverMean;
};

const computePointOverMeanByCategory = (votes: VoteModel[], category: VoteType): number | null => {
  const categoryVotes = votes.map((vote) => vote[category]).filter((value): value is number => value !== null && !isNaN(value));
  if (categoryVotes.length === 0) {
    return null;
  }
  const mean = round2(categoryVotes.reduce((acc, value) => acc + value, 0) / categoryVotes.length);
  const pointValueOverMean = pointsValues.find((value) => value >= mean) ?? pointsValues[pointsValues.length - 1];
  return pointValueOverMean;
};

const upsertVoteSchema = v.object({
  userId: v.string(),
  roomId: v.string(),
  type: v.union([v.literal('complexity'), v.literal('effort'), v.literal('uncertainty')]),
  value: v.nullish(v.number())
});
export const upsertVote = command(upsertVoteSchema, ({ userId, roomId, type, value }) => {
  const data: Vote = {
    room_id: roomId,
    user_id: userId
  };
  data[type] = value;
  return supabase
    .from('votes')
    .upsert(data, {
      onConflict: 'room_id, user_id'
    })
    .select();
});

export const resetVotesByRoomId = command(v.string(), (roomId) => {
  return supabase.from('votes').update({ complexity: null, effort: null, uncertainty: null }).eq('room_id', roomId);
});
