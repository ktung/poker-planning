import { supabase } from '$lib/supabaseClient';

export const fetchRoom = (slug: string) => {
  return supabase.from('rooms').select().eq('name', slug).single();
};
