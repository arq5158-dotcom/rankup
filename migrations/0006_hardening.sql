-- Payments must never default to completed (that credited ranks without Stripe).
alter table payments alter column status set default 'pending';

-- One live row per player per cycle. Stops double-insert races on fulfill.
create unique index if not exists leaderboard_user_cycle_uniq
  on leaderboard (user_id, cycle_type, cycle_start)
  where user_id is not null;
