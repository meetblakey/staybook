-- Enable RLS
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.bookings enable row level security;
alter table public.threads enable row level security;
alter table public.messages enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.reviews enable row level security;

-- profiles
create policy "profiles_read_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- listings
create policy "listings_select" on public.listings for select using (status='published' or host_id = auth.uid());
create policy "listings_insert_host" on public.listings for insert to authenticated with check (host_id = auth.uid());
create policy "listings_update_host" on public.listings for update using (host_id = auth.uid());
create policy "listings_delete_host" on public.listings for delete using (host_id = auth.uid());

-- listing_photos
create policy "photos_select_public" on public.listing_photos for select using (true);
create policy "photos_modify_host" on public.listing_photos
  for all using (exists (select 1 from public.listings l where l.id = listing_id and l.host_id = auth.uid()))
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.host_id = auth.uid()));

-- bookings (guests create; host/guest view/update; blocks only by host)
create policy "bookings_insert_guest" on public.bookings for insert to authenticated
  with check (
    guest_id = auth.uid()
    and kind in ('booking','block')
    and (
      (kind='booking' and exists (select 1 from public.listings l where l.id=listing_id and l.host_id <> auth.uid()))
      or
      (kind='block' and exists (select 1 from public.listings l where l.id=listing_id and l.host_id = auth.uid()))
    )
  );
create policy "bookings_select_participants" on public.bookings for select using (
  exists (select 1 from public.listings l where l.id = listing_id and l.host_id = auth.uid()) or guest_id = auth.uid()
);
create policy "bookings_update_participants" on public.bookings for update using (
  exists (select 1 from public.listings l where l.id = listing_id and l.host_id = auth.uid()) or guest_id = auth.uid()
);

-- threads/messages
create policy "threads_participants" on public.threads for all using (host_id = auth.uid() or guest_id = auth.uid()) with check (host_id = auth.uid() or guest_id = auth.uid());
create policy "messages_participants" on public.messages for all using (
  exists (select 1 from public.threads t where t.id = thread_id and (t.host_id = auth.uid() or t.guest_id = auth.uid()))
) with check (
  exists (select 1 from public.threads t where t.id = thread_id and (t.host_id = auth.uid() or t.guest_id = auth.uid()))
);

-- wishlists
create policy "wishlists_owner" on public.wishlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "wishlist_items_owner" on public.wishlist_items for all using (
  exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid())
) with check (
  exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid())
);

-- reviews
create policy "reviews_select_public" on public.reviews for select using (true);
create policy "reviews_insert_booking_parties" on public.reviews for insert to authenticated with check (
  exists (
    select 1 from public.bookings b
    join public.listings l on l.id = b.listing_id
    where b.id = booking_id
      and (
        (author_id = b.guest_id and target_user_id = l.host_id)
        or
        (author_id = l.host_id and target_user_id = b.guest_id)
      )
  )
);
