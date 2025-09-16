-- Cancellation policies
create table if not exists public.cancellation_policies(
  id text primary key,
  name text not null,
  rules jsonb not null
);

insert into public.cancellation_policies (id, name, rules) values
  (
    'flex',
    'Flexible',
    '{"free_until_hours":24,"refund_table":[{"before_hours":24,"guest_pct":100},{"before_hours":0,"guest_pct":0}]}'::jsonb
  )
on conflict do nothing;

alter table public.listings
  add column if not exists cancellation_policy_id text references public.cancellation_policies(id) default 'flex';

-- Price rules & overrides
create type if not exists price_rule_kind as enum (
  'weekend_markup',
  'seasonal',
  'length_of_stay',
  'last_minute',
  'early_bird',
  'extra_guest',
  'pet_fee'
);

create table if not exists public.listing_price_rules(
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  kind price_rule_kind not null,
  date_range daterange,
  min_nights int default 0,
  threshold_days int default 0,
  amount numeric(10,2) not null,
  is_percent boolean default false,
  extra_guest_threshold int default 0,
  created_at timestamptz default now()
);

create table if not exists public.calendar_overrides(
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  date date not null,
  price numeric(10,2) not null
);
create unique index if not exists calendar_overrides_uniq on public.calendar_overrides(listing_id, date);

-- Taxes & fee rules
create table if not exists public.tax_rules(
  id uuid primary key default gen_random_uuid(),
  country text,
  state text,
  city text,
  occupancy_tax_pct numeric(5,2) default 0,
  created_at timestamptz default now()
);

create table if not exists public.fee_rules(
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade,
  service_fee_bps int default 1200,
  cleaning_fee numeric(10,2) default 0,
  security_deposit numeric(10,2) default 0,
  extra_guest_fee numeric(10,2) default 0,
  pet_fee numeric(10,2) default 0
);

-- Payments & payouts
create table if not exists public.payment_intents(
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique references public.bookings(id) on delete cascade,
  provider text not null default 'stripe',
  provider_id text,
  client_secret text,
  status text default 'requires_payment_method',
  amount_total integer not null,
  currency text not null default 'usd',
  created_at timestamptz default now()
);

create table if not exists public.payout_accounts(
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stripe_account_id text,
  status text default 'unlinked',
  updated_at timestamptz default now()
);

create table if not exists public.payouts(
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique references public.bookings(id) on delete cascade,
  stripe_transfer_id text,
  amount integer not null,
  status text default 'scheduled',
  scheduled_for date,
  created_at timestamptz default now()
);

-- Identity verification (manual review stub)
create table if not exists public.verification_requests(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  doc_front_path text,
  doc_back_path text,
  status text check (status in ('pending','approved','rejected')) default 'pending',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz
);

-- Saved searches & alerts
create table if not exists public.saved_searches(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  filters jsonb not null,
  notify boolean default true,
  created_at timestamptz default now()
);

-- Collaborative wishlists
create table if not exists public.wishlist_collaborators(
  wishlist_id uuid references public.wishlists(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('owner','editor','viewer')) default 'editor',
  primary key (wishlist_id, user_id)
);

-- Reports & moderation
create type if not exists report_kind as enum ('listing','message','user','review');
create table if not exists public.reports(
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id),
  kind report_kind not null,
  target_id uuid not null,
  reason text,
  status text default 'open',
  created_at timestamptz default now()
);

-- Superhost metrics (materialized)
create materialized view if not exists public.host_metrics as
select
  p.id as host_id,
  coalesce(avg(r.overall), 0) as avg_rating,
  coalesce(
    sum(case when b.status = 'canceled' and b.guest_id is not null then 1 else 0 end)::float / nullif(count(b.id), 0),
    0
  ) as cancel_rate,
  0.95 as response_rate
from profiles p
left join listings l on l.host_id = p.id
left join bookings b on b.listing_id = l.id
left join reviews r on r.listing_id = l.id
group by p.id;

-- Currency table
create table if not exists public.exchange_rates(
  base text default 'USD',
  quote text not null,
  rate numeric(12,6) not null,
  as_of date not null,
  primary key (base, quote, as_of)
);

-- ICS external calendars
create table if not exists public.external_calendars(
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  url text not null,
  kind text default 'ics',
  created_at timestamptz default now()
);

-- Audit logs
create table if not exists public.audit_logs(
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  entity text,
  entity_id uuid,
  meta jsonb,
  created_at timestamptz default now()
);
