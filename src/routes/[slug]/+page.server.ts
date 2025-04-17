import { supabase } from '$lib/supabaseClient.js';

export const load = ({ params }) => {
  supabase
    .channel('room_status')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms'
        // filter: `id=eq.${currentRoomId}`
      },
      (payload) => {
        console.log('Change received!', payload);
      }
    )
    .subscribe();

  return {
    slug: params.slug
  };
};
