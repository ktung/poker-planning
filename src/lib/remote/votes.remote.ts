import { command, query } from '$app/server';
import { supabase } from '$lib/server/supabaseClient';
import { logger } from '$lib/util/logger';
import * as v from 'valibot';

interface Vote {
  room_id: string;
  user_id: string;
  complexity?: number | null;
  effort?: number | null;
  uncertainty?: number | null;
}

export const fetchVotesAndUsersByRoomId = query(v.string(), async (roomId) => {
  const { data, error } = await supabase.from('votes').select('complexity, effort, uncertainty, users ( username )').eq('room_id', roomId);
  if (!data || error) {
    logger.error('Error fetching votes:', error);
    throw error;
  }
  return data.map((vote) => ({
    complexity: vote.complexity,
    effort: vote.effort,
    uncertainty: vote.uncertainty,
    username: vote.users.username
  }));
});

const upsertVoteSchema = v.object({
  userId: v.string(),
  roomId: v.string(),
  type: v.union([v.literal('complexity'), v.literal('effort'), v.literal('uncertainty')]),
  value: v.nullable(v.number())
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
