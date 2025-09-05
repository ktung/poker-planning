import { command, query } from '$app/server';
import { supabase } from '$lib/server/supabaseClient';
import * as v from 'valibot';

export const getMessages = query(v.string(), (roomId) => {
  return supabase.from('messages').select('id, message, created_at').eq('room_id', roomId);
});

const pushMessageSchema = v.object({
  roomId: v.string(),
  userId: v.string(),
  message: v.string()
});
export const pushMessage = command(pushMessageSchema, ({ roomId, userId, message }) => {
  return supabase.from('messages').insert({
    room_id: roomId,
    user_id: userId,
    message: message,
    created_at: new Date().toISOString()
  });
});
