import { redirect } from '@sveltejs/kit';
import { form, getRequestEvent } from '$app/server';
import { supabase } from '$lib/server/supabaseClient';
import { logger } from '$lib/util/logger';
import { generateRoomId } from '$lib/util/room';
import { pushMessage } from './messages.remote';
import { upsertVote } from './votes.remote';

export const createRoom = form(async (formData) => {
  const username = formData.get('username')?.toString().trim();
  if (!username) {
    logger.error('Username is required to create a room');
    throw new Error('Username is required to create a room');
  }

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
  cookies.set('userId', user.id, { path: '/', httpOnly: true, secure: true });
  pushMessage({ roomId: room.id, userId: user.id, message: `${username} joined the room` }).then();

  redirect(303, `/${room.name}`);
});

export const joinRoom = form(async (formData) => {
  const username = formData.get('username')?.toString().trim();
  const roomId = formData.get('roomId')?.toString().trim();
  if (!username || !roomId) {
    logger.error('Username and roomId is required to join a room');
    throw new Error('Username and roomId is required to join a room');
  }

  const { data: room, error: roomsError } = await supabase.from('rooms').select().eq('id', roomId).single();
  if (roomsError || !room) {
    logger.error('Error fetching room', roomsError);
    throw new Error('Error fetching room');
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
  cookies.set('userId', user.id, { path: '/', httpOnly: true, secure: true });
  pushMessage({ roomId: room.id, userId: user.id, message: `${username} joined the room` }).then();

  redirect(303, `/${room.name}`);
});
