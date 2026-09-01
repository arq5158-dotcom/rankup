alter table profiles alter column two_factor_enabled set default false;
update profiles set two_factor_enabled = false;

alter table profiles add column if not exists two_factor_secret text;
alter table profiles add column if not exists two_factor_pending text;

create table if not exists two_factor_unlock (
  user_id text not null,
  session_key text not null,
  expires_at timestamptz not null,
  primary key (user_id, session_key)
);
create index if not exists two_factor_unlock_exp_idx on two_factor_unlock (expires_at);
