import { supabase } from '../supabaseClient';

export const deleteUserByUserIdAndRoomId = (userId: string, roomId: string) => {
  return supabase.from('users').delete().match({
    room_id: roomId,
    id: userId
  });
};
