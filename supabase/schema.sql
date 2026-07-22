-- Portfolio Tracker schema.
-- Holdings are derived from trades at query time — there is no holdings table.
-- Run this once against a fresh Supabase project (SQL Editor, or `supabase db push`).

create table trades (
  id bigint generated always as identity primary key,
  date date not null,
  ticker text not null,
  action text not null check (action in ('buy', 'sell')),
  shares numeric not null check (shares > 0),
  price numeric not null check (price >= 0),
  total numeric not null,
  reason text,
  realized_gain numeric
);

create table snapshots (
  id bigint generated always as identity primary key,
  date date not null unique,
  total_cost numeric not null,
  total_value numeric not null
);

create table snapshot_positions (
  id bigint generated always as identity primary key,
  snapshot_id bigint not null references snapshots (id) on delete cascade,
  ticker text not null,
  shares numeric not null,
  close_price numeric not null,
  value numeric not null,
  unique (snapshot_id, ticker)
);

create table benchmarks (
  id bigint generated always as identity primary key,
  date date not null,
  ticker text not null check (ticker in ('VOO', 'VTI', 'XLK')),
  close numeric not null,
  unique (date, ticker)
);

create index trades_date_idx on trades (date);
create index trades_ticker_idx on trades (ticker);
create index snapshot_positions_snapshot_id_idx on snapshot_positions (snapshot_id);
create index benchmarks_date_idx on benchmarks (date);

-- RLS: anon (public share view) can read everything, write nothing.
-- All writes go through the service role key (import script, cron job,
-- trade-entry route), which bypasses RLS entirely.
alter table trades enable row level security;
alter table snapshots enable row level security;
alter table snapshot_positions enable row level security;
alter table benchmarks enable row level security;

create policy "public read trades" on trades for select using (true);
create policy "public read snapshots" on snapshots for select using (true);
create policy "public read snapshot_positions" on snapshot_positions for select using (true);
create policy "public read benchmarks" on benchmarks for select using (true);
