import { supabase } from '$lib/supabaseClient';

export const fetchRoom = (slug: string) => {
  return supabase.from('rooms').select().eq('name', slug).single();
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

export const deleteRoomByName = (name: string) => {
  return supabase.from('rooms').delete().eq('name', name);
};
