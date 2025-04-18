import { browser } from '$app/environment';
import { upsertUser } from '$lib/db/users';
import { logger } from '$lib/util/logger';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, parent }) => {
  const parentData = await parent();
  const { sessionId } = parentData;
  const slug = data.slug;
  const roomId = data.roomId;

  const { error } = await upsertUser(sessionId, roomId, getUsername());
  if (error) {
    logger.error('Error upserting users', error);
  }

  return {
    slug: slug,
    roomId: roomId
  };
};

const getUsername = () => {
  if (browser) {
    return window.localStorage.getItem('username') || '' + Math.floor(Math.random() * 1000);
  }
  return '' + Math.floor(Math.random() * 1000);
};
