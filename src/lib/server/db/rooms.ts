import { supabase } from '../supabaseClient';

export const fetchRoom = (roomName: string) => {
  return supabase.from('rooms').select().eq('name', roomName).single();
};

export const upsertRoom = (slug: string) => {
  return supabase
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
};
