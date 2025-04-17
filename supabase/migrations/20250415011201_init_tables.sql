-- Create tables with real-time enabled
create table rooms (
  id text primary key,
  name text,
  created_at timestamp default now(),
  is_voting_active boolean default true
);

create table participants (
  id uuid default uuid_generate_v4() primary key,
  room_id text references rooms(id) on delete cascade,
  user_id text,
  username text,
  is_admin boolean default false,
  joined_at timestamp default now()
);

create table votes (
  room_id text references rooms(id) on delete cascade,
  user_id text,
  value text,
  primary key (room_id, user_id)
);

-- Enable real-time for all tables
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table votes;
