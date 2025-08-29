import { upsertRoom } from '$lib/server/db/rooms';
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
    roomId: room.id
  };
};
