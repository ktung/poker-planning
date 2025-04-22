import { supabase } from '$lib/supabaseClient';

export const getMessages = (roomId: string) => {
  return supabase.from('messages').select('message, created_at').eq('room_id', roomId);
};

export const pushMessage = (roomId: string, userId: string, message: string) => {
  return supabase.from('messages').insert({
    room_id: roomId,
    user_id: userId,
    message: message,
    created_at: new Date().toISOString()
  });
};
