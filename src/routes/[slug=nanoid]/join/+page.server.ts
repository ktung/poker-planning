import { redirect } from '@sveltejs/kit';
import { fetchRoom } from '$lib/server/db/rooms';
import { logger } from '$lib/util/logger';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug;

  const { data, error } = await fetchRoom(slug);

  if (!data || error) {
    logger.error('Error joining room', error);
    redirect(302, '/');
  }

  return {
    roomId: data.id,
    slug: slug
  };
};
