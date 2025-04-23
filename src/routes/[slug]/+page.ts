import { selectUsers, upsertUser } from '$lib/db/users';
import { getUsername } from '$lib/store/username';
import { logger } from '$lib/util/logger';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, parent }) => {
  const parentData = await parent();
  const { sessionId } = parentData;
  const slug = data.slug;
  const roomId = data.roomId;

  const { data: currentUser, error } = await upsertUser(sessionId, roomId, getUsername());
  if (error || !currentUser) {
    logger.error('Error upserting users', error);
    throw new Error('Error upserting users');
  }

  const { error: errorSelect } = await selectUsers(roomId);
  if (errorSelect) {
    logger.error('Error selecting users', errorSelect);
    throw new Error('Error selecting users');
  }

  return {
    slug: slug,
    roomId: roomId,
    userId: currentUser.id,
    username: currentUser.username
  };
};
