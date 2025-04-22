import { REALTIME_LISTEN_TYPES, REALTIME_PRESENCE_LISTEN_EVENTS } from '@supabase/supabase-js';
import { supabase } from '$lib/supabaseClient.js';
import { logger } from '$lib/util/logger';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug;

  const { data: room, error } = await supabase
    .from('rooms')
    .upsert(
      {
        name: slug,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: 'name'
      }
    )
    .select()
    .single();
  if (error || !room) {
    logger.error('Error upserting room', error);
    throw new Error('Error upserting room');
  }

  const votesChannel = supabase
    .channel(slug)
    .on(REALTIME_LISTEN_TYPES.BROADCAST, { event: 'clearVotes' }, () => {
      supabase
        .from('votes')
        .delete()
        .eq('room_id', room.id)
        .then(({ error }) => {
          if (error) {
            logger.error('Error deleting vote:', error);
          } else {
            logger.debug(`Vote deleted successfully on room ${slug}`);
          }
        });
    })
    .subscribe();

  const presenceChannel = supabase
    .channel(`presence:${slug}`)
    .on(REALTIME_LISTEN_TYPES.PRESENCE, { event: REALTIME_PRESENCE_LISTEN_EVENTS.LEAVE }, async () => {
      const state = await presenceChannel.presenceState();
      if (Object.keys(state).length === 0) {
        const { data } = await supabase.from('rooms').delete().eq('name', slug);
        votesChannel.unsubscribe();
        presenceChannel.unsubscribe();
      }
      logger.debug('presence state', state);
    })
    .subscribe();

  return {
    slug: room.name,
    roomId: room.id
  };
};
