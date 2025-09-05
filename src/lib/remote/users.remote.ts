import { command } from '$app/server';
import { supabase } from '$lib/server/supabaseClient';
import * as v from 'valibot';

const upsertUserSchema = v.object({
  roomId: v.string(),
  username: v.string()
});
export const upsertUser = command(upsertUserSchema, async ({ roomId, username }) => {
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
