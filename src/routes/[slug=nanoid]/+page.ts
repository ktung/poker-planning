import { fetchVotesAndUsersByRoomId, upsertVote } from '$lib/db/votes';
import { pushMessage } from '$lib/remote/messages.remote';
import { upsertUser } from '$lib/remote/users.remote';
import { getUsername } from '$lib/store/username';
import { logger } from '$lib/util/logger';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
  const slug = data.slug;
  const roomId = data.roomId;
  const protipsTexts = data.protipsTexts;

  const { data: currentUser, error } = await upsertUser({ roomId: roomId, username: getUsername() });
  if (error || !currentUser) {
    logger.error('Error upserting users', error);
    throw new Error('Error upserting users');
  }
  await upsertVote(currentUser.id, roomId, 'complexity', null);
  pushMessage({ roomId, userId: currentUser.id, message: `${getUsername()} joined the room` }).then();

  const { data: currentVotesData, error: currentVotesQueryError } = await fetchVotesAndUsersByRoomId(roomId);
  if (currentVotesQueryError) {
    logger.error('Error selecting current votes', currentVotesQueryError);
    throw new Error('Error selecting current votes');
  }
  const currentVotes = currentVotesData.map((vote) => {
    return {
      complexity: vote.complexity,
      effort: vote.effort,
      uncertainty: vote.uncertainty,
      username: vote.users.username
    };
  });

  return {
    slug: slug,
    roomId: roomId,
    userId: currentUser.id,
    username: currentUser.username,
    currentVotes: currentVotes,
    protipsTexts: protipsTexts
  };
};
