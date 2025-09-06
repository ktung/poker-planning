import { supabase } from '../supabaseClient';

export const fetchRoom = (roomName: string) => {
  return supabase.from('rooms').select().eq('name', roomName).single();
};
