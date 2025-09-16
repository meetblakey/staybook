-- Extensions
create extension if not exists pgcrypto;
create extension if not exists btree_gist;
create extension if not exists postgis;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text check (role in ('guest','host','admin')) default 'guest',
  created_at timestamptz default now()
);

-- Listings
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  property_type text,
  room_type text,
  max_guests int not null check (max_guests > 0),
  bedrooms int default 0,
  beds int default 1,
  bathrooms numeric(3,1) default 1.0,
  price_nightly numeric(10,2) not null check (price_nightly >= 0),
  cleaning_fee numeric(10,2) default 0,
  service_fee numeric(10,2) default 0,
  currency text default 'USD',
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  country text,
  postal_code text,
  location geography(point, 4326),
  amenities jsonb not null default '[]'::jsonb,
  status text check (status in ('draft','published','snoozed','paused','deleted')) default 'draft',
  created_at timestamptz default now(),
  search tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(city,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(country,'')), 'A')
  ) stored
);
create index if not exists listings_search_idx on public.listings using gin (search);
create index if not exists listings_location_idx on public.listings using gist (location);

-- Photos
create table if not exists public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  path text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Bookings & blocks
create type booking_kind as enum ('booking','block');

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  guest_id uuid references public.profiles(id) on delete set null,
  kind booking_kind not null default 'booking',
  date_range daterange not null,
  guests_count int not null default 1 check (guests_count > 0),
  total_price numeric(10,2) not null default 0,
  status text check (status in ('pending','confirmed','canceled','completed')) default 'pending',
  payment_status text check (payment_status in ('unpaid','paid','refunded','test')) default 'test',
  created_at timestamptz default now(),
  constraint valid_range check (lower(date_range) < upper(date_range))
);

-- Prevent overlapping bookings/blocks (pending/confirmed only)
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    listing_id with =,
    date_range with &&
  )
  where (status in ('pending','confirmed'));

-- Messaging
create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  guest_id uuid not null references public.profiles(id) on delete cascade,
  host_id uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz,
  status text check (status in ('open','archived','resolved')) default 'open',
  created_at timestamptz default now(),
  unique (guest_id, host_id, listing_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Wishlists
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  created_at timestamptz default now()
);
create table if not exists public.wishlist_items (
  wishlist_id uuid references public.wishlists(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  primary key (wishlist_id, listing_id)
);

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  overall int not null check (overall between 1 and 5),
  cleanliness int check (cleanliness between 1 and 5),
  accuracy int check (accuracy between 1 and 5),
  checkin int check (checkin between 1 and 5),
  communication int check (communication between 1 and 5),
  location int check (location between 1 and 5),
  value int check (value between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique (booking_id, author_id)
);

-- Profile autocreate on new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
