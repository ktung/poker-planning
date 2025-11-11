import { redirect } from '@sveltejs/kit';
import { form, getRequestEvent } from '$app/server';
import { findUser } from '$lib/server/db/users';
import { supabase } from '$lib/server/supabaseClient';
import { logger } from '$lib/util/logger';
import { generateRoomId } from '$lib/util/room';
import * as v from 'valibot';
import { pushMessage } from './messages.remote';
import { upsertVote } from './votes.remote';

const formSchema = v.object({
  username: v.pipe(v.string(), v.trim(), v.nonEmpty())
});
export const createRoom = form(formSchema, async ({ username }) => {
  const { data: room, error: roomsError } = await supabase.from('rooms').insert({ name: generateRoomId() }).select().single();
  if (roomsError || !room) {
    logger.error('Error insert room', roomsError);
    throw new Error('Error insert room');
  }

  const { data: user, error: usersError } = await supabase
    .from('users')
    .insert({
      room_id: room.id,
      username: username
    })
    .select()
    .single();
  if (usersError || !user) {
    logger.error('Error insert user', usersError);
    throw new Error('Error insert user');
  }
  // init votes
  await upsertVote({ userId: user.id, roomId: room.id, type: 'complexity', value: null });
  const { cookies } = getRequestEvent();
  cookies.set('userId', user.id, { path: '/', httpOnly: true, secure: true, maxAge: 86400 });
  pushMessage({ roomId: room.id, userId: user.id, message: `${username} joined the room` }).then();

  redirect(303, `/${room.name}`);
});

const joinRoomSchema = v.object({
  username: v.pipe(v.string(), v.trim(), v.nonEmpty()),
  roomId: v.pipe(v.string(), v.trim(), v.nonEmpty())
});
export const joinRoom = form(joinRoomSchema, async ({ username, roomId }) => {
  const { data: room, error: roomsError } = await supabase.from('rooms').select().eq('id', roomId).single();
  if (roomsError || !room) {
    logger.error('Error fetching room', roomsError);
    throw new Error('Error fetching room');
  }

  const { cookies } = getRequestEvent();
  let user;
  const cookieUserId = cookies.get('userId');
  if (cookieUserId) {
    const { data: currentUser, error: userError } = await findUser(cookieUserId);
    if (userError) {
      logger.error('Error finding user', userError);
    }
    user = currentUser;
  }

  if (!user) {
    const { data: newUser, error: usersError } = await supabase
      .from('users')
      .insert({
        room_id: room.id,
        username: username
      })
      .select()
      .single();
    user = newUser;

    if (usersError) {
      logger.error('Error insert user', usersError);
    }
  }

  if (!user) {
    throw new Error('Error insert user');
  }
  // init votes
  Promise.all([
    upsertVote({ userId: user.id, roomId: room.id, type: 'complexity', value: null }),
    upsertVote({ userId: user.id, roomId: room.id, type: 'effort', value: null }),
    upsertVote({ userId: user.id, roomId: room.id, type: 'uncertainty', value: null })
  ]);
  cookies.set('userId', user.id, { path: '/', httpOnly: true, secure: true, maxAge: 86400 });
  pushMessage({ roomId: room.id, userId: user.id, message: `${username} joined the room` }).then();

  redirect(303, `/${room.name}`);
});
