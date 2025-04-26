import { REALTIME_LISTEN_TYPES } from '@supabase/supabase-js';
import { upsertRoom } from '$lib/db/rooms';
import { deleteVotesByRoomId, fetchVotesAndUsersByRoomId } from '$lib/db/votes';
import { supabase } from '$lib/supabaseClient.js';
import { logger } from '$lib/util/logger';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug;

  const { data: room, error } = await upsertRoom(slug);
  if (error || !room) {
    logger.error('Error upserting room', error);
    throw new Error('Error upserting room');
  }

  const { data: currentVotesData, error: currentVotesQueryError } = await fetchVotesAndUsersByRoomId(room.id);
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

  supabase
    .channel(slug)
    .on(REALTIME_LISTEN_TYPES.BROADCAST, { event: 'clearVotes' }, () => {
      deleteVotesByRoomId(room.id).then(({ error }) => {
        if (error) {
          logger.error('Error deleting vote:', error);
        } else {
          logger.debug(`Vote deleted successfully on room ${slug}`);
        }
      });
    })
    .subscribe();

  return {
    slug: room.name,
    roomId: room.id,
    currentVotes: currentVotes
  };
};
