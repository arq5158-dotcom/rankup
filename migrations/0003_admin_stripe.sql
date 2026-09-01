alter table profiles add column if not exists email text;
alter table profiles add column if not exists is_owner boolean not null default false;

create unique index if not exists profiles_email_idx on profiles (email) where email is not null;

alter table payments add column if not exists stripe_session_id text;
alter table payments add column if not exists stripe_payment_intent text;
alter table payments add column if not exists display_name text;
alter table payments add column if not exists short_note text;
alter table payments add column if not exists web_link text;

create unique index if not exists payments_stripe_session_idx
  on payments (stripe_session_id) where stripe_session_id is not null;

insert into config (key, value) values ('pendingAdminEmails', '[]')
  on conflict (key) do nothing;
