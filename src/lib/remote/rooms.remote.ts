import { redirect } from '@sveltejs/kit';
import { form } from '$app/server';
import { supabase } from '$lib/server/supabaseClient';
import { logger } from '$lib/util/logger';
import { generateRoomId } from '$lib/util/room';

export const createRoom = form(async () => {
  const randomRoomId = generateRoomId();

  const { data: room, error } = await supabase.from('rooms').insert({ name: randomRoomId }).select().single();
  if (error || !room) {
    logger.error('Error upserting room', error);
    throw new Error('Error upserting room');
  }

  redirect(303, `/${randomRoomId}`);
});
