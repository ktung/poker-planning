import { supabase } from '$lib/supabaseClient.js';
import { logger } from '$lib/util/logger';
import { REALTIME_LISTEN_TYPES } from '@supabase/supabase-js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug;

  const { data: room, error } = await supabase
    .from('rooms')
    .upsert(
      {
        name: slug,
        updated_at: new Date()
      },
      {
        onConflict: 'name'
      }
    )
    .select()
    .single();
  if (error) {
    logger.error('Error upserting room', error);
  }

  supabase
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
            logger.debug('Vote deleted successfully');
          }
        });
    })
    .subscribe();

  return {
    slug: room.name,
    roomId: room.id
  };
};
