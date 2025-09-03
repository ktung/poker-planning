import { supabase } from '$lib/supabaseClient';

export const upsertUser = (roomId: string, username: string) => {
  return supabase
    .from('users')
    .upsert(
      {
        room_id: roomId,
        username: username
      },
      {
        onConflict: 'id'
      }
    )
    .select()
    .single();
};
