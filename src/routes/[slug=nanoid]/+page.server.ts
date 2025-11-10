import { error } from '@sveltejs/kit';
import { fetchVotesAndUsersByRoomId } from '$lib/remote/votes.remote';
import { fetchRoom } from '$lib/server/db/rooms';
import { findUser } from '$lib/server/db/users';
import { logger } from '$lib/util/logger';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
  const slug = params.slug;
  const userId = cookies.get('userId');

  if (!slug || !userId) {
    logger.error('Missing slug or userId');
    throw new Error('Missing slug or userId');
  }

  const { data: room, error: fetchError } = await fetchRoom(slug);
  if (fetchError || !room) {
    logger.error('Error fetching room', error);
    error(404, 'Error fetching room');
  }

  const { data: currentUser, error: userError } = await findUser(userId);
  if (userError || !currentUser) {
    logger.error('Error fetching user', userError);
    error(404, 'Error fetching user');
  }

  const currentVotes = (await fetchVotesAndUsersByRoomId(room.id)).votes;

  return {
    slug: room.name,
    roomId: room.id,
    userId: currentUser.id,
    username: currentUser.username,
    currentVotes: currentVotes
  };
};
