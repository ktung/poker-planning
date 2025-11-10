import { supabase } from '../supabaseClient';

export const selectUsers = (roomId: string) => {
  return supabase.from('users').select().eq('room_id', roomId);
};

export const findUser = (userId: string) => {
  return supabase.from('users').select().eq('id', userId).single();
};

export const deleteUserByUserIdAndRoomId = (userId: string, roomId: string) => {
  return supabase.from('users').delete().match({
    room_id: roomId,
    id: userId
  });
};
