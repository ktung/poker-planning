create table rooms (
  id uuid not null default uuid_generate_v4() primary key,
  name text not null unique CHECK (length(name) <= 6),
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create table users (
  id uuid not null default uuid_generate_v4() primary key,
  session_id uuid not null,
  room_id uuid not null references rooms(id) on delete cascade,
  username text not null,
  created_at timestamp not null default now()
);

create table votes (
  room_id uuid not null references rooms(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  value text not null,
  primary key (room_id, user_id, type)
);

-- Enable real-time for all tables
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table votes;
