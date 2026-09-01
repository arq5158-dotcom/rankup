alter table profiles add column if not exists credits double precision not null default 0;

create table if not exists credit_ledger (
  id serial primary key,
  user_id text not null,
  kind text not null,
  credits_delta double precision not null default 0,
  score_delta double precision not null default 0,
  cycle_type text,
  stripe_session_id text,
  spin_id text,
  created_at timestamptz not null default now()
);

create unique index if not exists credit_ledger_stripe_uidx
  on credit_ledger (stripe_session_id) where stripe_session_id is not null;
create unique index if not exists credit_ledger_spin_uidx
  on credit_ledger (spin_id) where spin_id is not null;
create index if not exists credit_ledger_user_idx on credit_ledger (user_id, created_at desc);

create table if not exists spin_segments (
  slot int primary key check (slot between 1 and 6),
  label text not null,
  score_reward double precision not null,
  image text,
  enabled boolean not null default true
);

insert into spin_segments (slot, label, score_reward, enabled) values
  (1, 'Boost', 100, true),
  (2, 'Climb', 250, true),
  (3, 'Charge', 500, true),
  (4, 'Mega', 1000, true),
  (5, 'Super', 2500, true),
  (6, 'Jackpot', 5000, true)
on conflict (slot) do nothing;

create table if not exists spins (
  id text primary key,
  user_id text not null,
  segment_slot int not null,
  score_reward double precision not null,
  config_json text not null,
  claimed boolean not null default false,
  claimed_at timestamptz,
  monthly_score double precision,
  monthly_rank int,
  weekly_score double precision,
  weekly_rank int,
  created_at timestamptz not null default now()
);

create index if not exists spins_user_idx on spins (user_id, created_at desc);
