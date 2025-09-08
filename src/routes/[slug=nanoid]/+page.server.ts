import { m } from '$lib/paraglide/messages';
import { fetchVotesAndUsersByRoomId } from '$lib/remote/votes.remote';
import { fetchRoom } from '$lib/server/db/rooms';
import { supabase } from '$lib/server/supabaseClient';
import { logger } from '$lib/util/logger';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
  const slug = params.slug;
  const userId = cookies.get('userId');

  if (!slug || !userId) {
    logger.error('Missing slug or userId');
    throw new Error('Missing slug or userId');
  }

  const { data: room, error } = await fetchRoom(slug);
  if (error || !room) {
    logger.error('Error fetching room', error);
    throw new Error('Error fetching room');
  }

  const { data: currentUser, error: userError } = await supabase.from('users').select().eq('id', userId).single();
  if (userError || !currentUser) {
    logger.error('Error fetching user', userError);
    throw new Error('Error fetching user');
  }

  const currentVotes = (await fetchVotesAndUsersByRoomId(room.id)).votes;

  return {
    slug: room.name,
    roomId: room.id,
    userId: currentUser.id,
    username: currentUser.username,
    protipsTexts: protipsTexts,
    currentVotes: currentVotes
  };
};

type ProtipsType = keyof typeof m;
const protipsTexts = {
  complexity: getTips('protips.complexity'),
  effort: getTips('protips.effort'),
  uncertainty: getTips('protips.uncertainty')
};

function getTips(prefix: string) {
  return Object.keys(m)
    .filter((key) => key.startsWith(prefix))
    .map((key) => <ProtipsType>key);
}
