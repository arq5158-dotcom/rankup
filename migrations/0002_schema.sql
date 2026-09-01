create table if not exists profiles (
  user_id text primary key,
  display_name text,
  short_note text,
  web_link text,
  profile_image text,
  is_admin boolean not null default false,
  two_factor_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists prizes (
  id serial primary key,
  position int not null,
  tier text not null,
  label text not null,
  amount double precision not null,
  cycle_type text not null
);

create table if not exists leaderboard (
  id serial primary key,
  user_id text,
  display_name text not null,
  short_note text,
  web_link text,
  profile_image text,
  amount_paid double precision not null,
  rank int not null,
  cycle_type text not null,
  cycle_start bigint not null,
  is_seed boolean not null default false,
  movement int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists leaderboard_cycle_idx on leaderboard (cycle_type, cycle_start, rank);
create index if not exists leaderboard_user_idx on leaderboard (user_id);

create table if not exists payments (
  id serial primary key,
  user_id text not null,
  amount double precision not null,
  cycle_type text not null,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

create index if not exists payments_user_idx on payments (user_id);

create table if not exists config (
  key text primary key,
  value text not null
);

create table if not exists archive (
  id serial primary key,
  cycle_type text not null,
  cycle_start bigint not null,
  cycle_end bigint not null,
  entries_json text not null,
  total_participants int not null,
  total_revenue double precision not null,
  created_at timestamptz not null default now()
);
