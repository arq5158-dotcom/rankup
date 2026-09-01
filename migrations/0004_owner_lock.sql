-- One owner forever. Nobody else can self-promote.
create unique index if not exists profiles_one_owner
  on profiles (is_owner)
  where is_owner = true;

insert into config (key, value) values ('pendingAdminEmails', '[]')
  on conflict (key) do nothing;
