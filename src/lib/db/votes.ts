import { supabase } from '$lib/supabaseClient';

export const upsertVote = async (userId: string, roomId: string, type: VoteType, value: number | null) => {
  const data = {
    room_id: roomId,
    user_id: userId
  };
  data[type] = value;
  return supabase
    .from('votes')
    .upsert(data, {
      onConflict: 'room_id, user_id'
    })
    .select();
};
