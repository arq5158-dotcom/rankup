alter table payments add column if not exists credits_purchased double precision;
alter table payments add column if not exists exchange_rate double precision;
alter table payments add column if not exists resulting_credits double precision;
alter table payments add column if not exists stripe_customer_id text;

alter table credit_ledger add column if not exists resulting_credits double precision;
alter table credit_ledger add column if not exists usd_amount double precision;
alter table credit_ledger add column if not exists note text;

insert into config (key, value)
values ('creditEconomy', '{"creditsPerUsd":1000,"minUsd":1,"maxUsd":10000,"packages":[1,5,10,25,50,100],"customEnabled":true,"purchaseEnabled":true,"promoBonusPct":0}')
on conflict (key) do nothing;
