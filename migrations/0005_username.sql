alter table profiles add column if not exists username text;
alter table leaderboard add column if not exists username text;

create unique index if not exists profiles_username_uniq
  on profiles (username)
  where username is not null;
