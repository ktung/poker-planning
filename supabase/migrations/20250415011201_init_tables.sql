create table rooms (
  id uuid not null default uuid_generate_v4() primary key,
  name text not null unique CHECK (length(name) <= 22),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id uuid not null default uuid_generate_v4() primary key,
  room_id uuid not null references rooms(id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now()
);

create table votes (
  room_id uuid not null references rooms(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  complexity float8,
  effort float8,
  uncertainty float8,
  primary key (room_id, user_id)
);

create table messages (
  id uuid not null default uuid_generate_v4() primary key,
  room_id uuid not null references rooms(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  message text not null
);

-- Enable real-time for all tables
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table messages;
