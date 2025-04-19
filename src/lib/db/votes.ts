import { supabase } from '$lib/supabaseClient';

export const upsertVote = async (
  sessionId: string,
  roomId: string,
  type: 'complexity' | 'effort' | 'uncertainty',
  value: number | null
) => {
  const { data: userId } = await supabase
    .from('users')
    .select('id')
    .eq('session_id', sessionId)
    .single();
  if (!userId || !userId.id) {
    throw new Error('User not found with session_id ' + sessionId);
  }

  return supabase
    .from('votes')
    .upsert(
      {
        room_id: roomId,
        user_id: userId.id,
        type: type,
        value: value
      },
      {
        onConflict: 'room_id, user_id, type'
      }
    )
    .select();
};
