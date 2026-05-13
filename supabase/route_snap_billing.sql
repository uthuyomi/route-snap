create table if not exists public.route_snap_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_id text not null default 'free' check (plan_id in ('free', 'light', 'standard', 'pro', 'business')),
  status text not null default 'inactive',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.route_snap_usage (
  subject_type text not null check (subject_type in ('user', 'anonymous')),
  subject_id text not null,
  user_id uuid references auth.users(id) on delete cascade,
  period_key text not null,
  image_ocr_used integer not null default 0,
  file_stops_used integer not null default 0,
  route_runs_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (subject_type, subject_id, period_key)
);

alter table public.route_snap_subscriptions enable row level security;
alter table public.route_snap_usage enable row level security;

drop policy if exists "Users can read their subscription" on public.route_snap_subscriptions;
create policy "Users can read their subscription"
  on public.route_snap_subscriptions
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can read their usage" on public.route_snap_usage;
create policy "Users can read their usage"
  on public.route_snap_usage
  for select
  using (auth.uid() = user_id);

