import { upsertRoom } from '$lib/db/rooms';
import { m } from '$lib/paraglide/messages';
import { logger } from '$lib/util/logger';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug;

  const { data: room, error } = await upsertRoom(slug);
  if (error || !room) {
    logger.error('Error upserting room', error);
    throw new Error('Error upserting room');
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
