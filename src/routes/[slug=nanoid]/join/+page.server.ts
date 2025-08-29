import { redirect } from '@sveltejs/kit';
import { logger } from '$lib/util/logger';
import type { PageServerLoad } from './$types';
import { fetchRoom } from '$lib/server/db/rooms';

export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug;
  logger.info(slug)

  const { error } = await fetchRoom(slug);

  if (error) {
    logger.error(`Error joining room`, error);
    redirect(302, '/');
  }

  return {
    slug: slug
  };
};
