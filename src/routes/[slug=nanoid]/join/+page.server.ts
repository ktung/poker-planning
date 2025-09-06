import { redirect } from '@sveltejs/kit';
import { fetchRoom } from '$lib/server/db/rooms';
import { logger } from '$lib/util/logger';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug;

  const { error } = await fetchRoom(slug);

  if (error) {
    logger.error(`Error joining room`, error);
    redirect(302, '/');
  }

  return {
    slug: slug
  };
};
