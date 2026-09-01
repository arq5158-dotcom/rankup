-- Tie each payment to the cycle it was opened in so a reset cannot
-- re-sum old charges onto a new board.
alter table payments add column if not exists cycle_start bigint;

-- Case-insensitive unique emails. Safe if mixed-case dupes already exist
-- (CREATE UNIQUE INDEX fails closed and the app still stores lowercased emails).
create unique index if not exists profiles_email_lower_uniq
  on profiles (lower(email))
  where email is not null;
