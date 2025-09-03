import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import type { Database } from './db/database.types';

export const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_API_KEY);
