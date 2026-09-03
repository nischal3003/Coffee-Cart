-- ==========================================================
--  MOKA cart — Supabase setup.  Run this ONCE.
--  Supabase dashboard → SQL Editor → New query → paste all → Run.
-- ==========================================================

-- MENU (all three founders can edit)
create table if not exists menu (
  id         text primary key,
  name       text not null,
  cat        text default 'Other',
  price      numeric not null default 0,
  cost       numeric not null default 0,
  updated_at timestamptz default now()
);

-- STOCK (manual counts)
create table if not exists stock (
  id    text primary key,
  name  text not null,
  qty   numeric not null default 0,
  unit  text default '',
  low   numeric not null default 0
);

-- BILLS (bill number auto-assigned by the database, so no clashes across phones)
create table if not exists bills (
  no    bigint generated always as identity primary key,
  ts    timestamptz not null default now(),
  items jsonb not null,
  total numeric not null default 0,
  pay   text not null default 'cash'
);

-- SETTINGS (single shared row)
create table if not exists settings (
  id        int primary key default 1,
  shop_name text default 'MOKA',
  gstin     text default '',
  gst_rate  numeric default 0,
  upi_id    text default '',
  upi_name  text default 'MOKA',
  constraint one_row check (id = 1)
);
insert into settings (id) values (1) on conflict (id) do nothing;

-- Row Level Security: open access for the app's anon key (no login).
alter table menu     enable row level security;
alter table stock    enable row level security;
alter table bills    enable row level security;
alter table settings enable row level security;

drop policy if exists p_menu     on menu;
drop policy if exists p_stock    on stock;
drop policy if exists p_bills    on bills;
drop policy if exists p_settings on settings;

create policy p_menu     on menu     for all using (true) with check (true);
create policy p_stock    on stock    for all using (true) with check (true);
create policy p_bills    on bills    for all using (true) with check (true);
create policy p_settings on settings for all using (true) with check (true);

-- Live sync: add the tables to the realtime broadcast.
alter publication supabase_realtime add table menu;
alter publication supabase_realtime add table stock;
alter publication supabase_realtime add table bills;
alter publication supabase_realtime add table settings;
