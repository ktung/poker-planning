import { REALTIME_LISTEN_TYPES } from '@supabase/supabase-js';
import { upsertRoom } from '$lib/db/rooms';
import { resetVotesByRoomId } from '$lib/db/votes';
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

  supabase
    .channel(slug)
    .on(REALTIME_LISTEN_TYPES.BROADCAST, { event: 'clearVotes' }, () => {
      resetVotesByRoomId(room.id).then(({ error }) => {
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
    roomId: room.id
  };
};
