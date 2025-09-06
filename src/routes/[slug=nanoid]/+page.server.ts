import { m } from '$lib/paraglide/messages';
import { fetchRoom } from '$lib/server/db/rooms';
import { logger } from '$lib/util/logger';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug;

  const { data: room, error } = await fetchRoom(slug);
  if (error || !room) {
    logger.error('Error fetching room', error);
    throw new Error('Error fetching room');
  }

  return {
    slug: room.name,
    roomId: room.id,
    protipsTexts: protipsTexts
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
