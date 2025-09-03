import { json } from '@sveltejs/kit';
import { pushMessage } from '$lib/db/messages';
import { deleteUserByUserIdAndRoomId, selectUsers } from '$lib/server/db/users';
import { logger } from '$lib/util/logger';
import type { RequestHandler } from './$types';

interface RequestBody {
  roomId: string;
  userId: string;
  users: UserTrackModel[];
}

export const POST: RequestHandler = async ({ request }) => {
  const data: RequestBody = await request.json();
  logger.debug('POST /api/rooms/sync', data);

  if (!data.roomId || !data.userId || !data.users) {
    logger.error('Invalid request body', data);
    throw error(400, 'Invalid request body');
  }

  const { data: usersDb, error } = await selectUsers(data.roomId);
  if (error || !usersDb) {
    // return json({ error: 'Error fetching users' }, { status: 500 });
    return json({});
  }
  logger.debug('usersDb', usersDb);

  const usersDbIds = usersDb.map((user) => user.id);
  const usersIds = data.users.map((user) => user.userId);
  const usersToDelete = usersDbIds.filter((userId) => !usersIds.includes(userId));
  logger.debug('usersToDelete', usersToDelete);
  for (const userId of usersToDelete) {
    await pushMessage(data.roomId, userId, `${usersDb.find((user) => user.id === userId)?.username} left the room`);
    const { error } = await deleteUserByUserIdAndRoomId(userId, data.roomId);
    if (error) {
      logger.error('Error deleting user:', error);
    }
  }

  return json(data);
};
