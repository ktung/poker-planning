import { supabase } from '../supabaseClient';

export const insertMessage = (roomId: string, userId: string, message: string) => {
  return supabase.from('messages').insert({
    room_id: roomId,
    user_id: userId,
    message: message,
    created_at: new Date().toISOString()
  });
};
