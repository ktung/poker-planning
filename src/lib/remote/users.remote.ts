import { command } from '$app/server';
import { insertMessage } from '$lib/server/db/messages';
import { deleteUserByUserIdAndRoomId } from '$lib/server/db/users';
import { supabase } from '$lib/server/supabaseClient';
import { logger } from '$lib/util/logger';
import * as v from 'valibot';

const upsertUserSchema = v.object({
  roomId: v.string(),
  username: v.string()
});
export const upsertUser = command(upsertUserSchema, ({ roomId, username }) => {
  return supabase
    .from('users')
    .upsert(
      {
        room_id: roomId,
        username: username
      },
      {
        onConflict: 'id'
      }
    )
    .select()
    .single();
});

const syncPresenceSchema = v.object({
  roomId: v.string(),
  users: v.array(
    v.object({
      userId: v.string(),
      onlineAt: v.string()
    })
  )
});
// Remove users from the database that are not in the presence list
export const syncPresence = command(syncPresenceSchema, async ({ roomId, users }) => {
  const activeUserIds = users.map((u) => u.userId);
  const { data: usersToDelete, error } = await supabase
    .from('users')
    .select()
    .eq('room_id', roomId)
    .not('id', 'in', `(${activeUserIds.join(',')})`);
  if (error) {
    logger.error('Error fetching users:', error);
    return;
  }

  logger.debug('Users to delete:', usersToDelete);
  usersToDelete?.forEach(async (user) => {
    Promise.all([deleteUserByUserIdAndRoomId(user.id, roomId), insertMessage(roomId, user.id, `${user.username} left the room`)]);
  });
});
