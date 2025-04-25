import { supabase } from '$lib/supabaseClient';

interface Vote {
  room_id: string;
  user_id: string;
  complexity?: number | null;
  effort?: number | null;
  uncertainty?: number | null;
}

export const fetchVotesAndUsersByRoomId = (roomId: string) => {
  return supabase.from('votes').select('complexity, effort, uncertainty, users ( username )').eq('room_id', roomId);
};

export const upsertVote = async (userId: string, roomId: string, type: VoteType, value: number | null) => {
  const data: Vote = {
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

export const deleteVotesByUserIdAndRoomId = (userId: string, roomId: string) => {
  return supabase.from('users').delete().match({
    room_id: roomId,
    id: userId
  });
};

export const deleteVotesByRoomId = (roomId: string) => {
  return supabase.from('votes').delete().eq('room_id', roomId);
};
