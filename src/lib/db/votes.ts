import { supabase } from '$lib/supabaseClient';

export const upsertVote = async (
  sessionId: string,
  roomId: string,
  type: 'complexity' | 'effort' | 'uncertainty',
  value: number | null
) => {
  return supabase
    .from('votes')
    .upsert(
      {
        room_id: roomId,
        user_id: sessionId,
        type: type,
        value: value
      },
      {
        onConflict: 'room_id, user_id, type'
      }
    )
    .select();
};
