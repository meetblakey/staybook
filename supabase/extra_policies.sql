-- Enable RLS on new tables
alter table public.listing_price_rules enable row level security;
alter table public.calendar_overrides enable row level security;
alter table public.tax_rules enable row level security;
alter table public.fee_rules enable row level security;
alter table public.payment_intents enable row level security;
alter table public.payout_accounts enable row level security;
alter table public.payouts enable row level security;
alter table public.verification_requests enable row level security;
alter table public.saved_searches enable row level security;
alter table public.wishlist_collaborators enable row level security;
alter table public.reports enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.external_calendars enable row level security;
alter table public.audit_logs enable row level security;

-- Listing price rules (hosts manage their own)
create policy if not exists "price_rules_host_access" on public.listing_price_rules
  for all using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.host_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.host_id = auth.uid()
    )
  );

create policy if not exists "price_rules_public_select" on public.listing_price_rules
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.status = 'published'
    )
  );

-- Calendar overrides
create policy if not exists "calendar_overrides_host_access" on public.calendar_overrides
  for all using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.host_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.host_id = auth.uid()
    )
  );

create policy if not exists "calendar_overrides_public_select" on public.calendar_overrides
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.status = 'published'
    )
  );

-- Tax rules (admin manage)
create policy if not exists "tax_rules_admin_manage" on public.tax_rules
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  ) with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

create policy if not exists "tax_rules_public_select" on public.tax_rules
  for select using (true);

-- Fee rules (hosts manage)
create policy if not exists "fee_rules_host_access" on public.fee_rules
  for all using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.host_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.host_id = auth.uid()
    )
  );

create policy if not exists "fee_rules_public_select" on public.fee_rules
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.status = 'published'
    )
  );

-- Payment intents (booking participants)
create policy if not exists "payment_intents_participants_read" on public.payment_intents
  for select using (
    exists (
      select 1 from public.bookings b
      join public.listings l on l.id = b.listing_id
      where b.id = booking_id
        and (b.guest_id = auth.uid() or l.host_id = auth.uid())
    )
  );

create policy if not exists "payment_intents_participants_write" on public.payment_intents
  for all using (
    exists (
      select 1 from public.bookings b
      join public.listings l on l.id = b.listing_id
      where b.id = booking_id
        and (b.guest_id = auth.uid() or l.host_id = auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.bookings b
      join public.listings l on l.id = b.listing_id
      where b.id = booking_id
        and (b.guest_id = auth.uid() or l.host_id = auth.uid())
    )
  );

-- Payout accounts (owner or admin)
create policy if not exists "payout_accounts_owner" on public.payout_accounts
  for all using (
    auth.uid() = user_id or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  ) with check (
    auth.uid() = user_id or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Payouts (host/admin read)
create policy if not exists "payouts_participants" on public.payouts
  for select using (
    exists (
      select 1 from public.bookings b
      join public.listings l on l.id = b.listing_id
      where b.id = booking_id
        and (l.host_id = auth.uid() or exists (
          select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  );

-- Verification requests
create policy if not exists "verification_requests_owner" on public.verification_requests
  for insert with check (user_id = auth.uid());
create policy if not exists "verification_requests_owner_read" on public.verification_requests
  for select using (user_id = auth.uid());
create policy if not exists "verification_requests_admin_manage" on public.verification_requests
  for all using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  ) with check (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Saved searches owner only
create policy if not exists "saved_searches_owner" on public.saved_searches
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Wishlist collaborators
create policy if not exists "wishlist_collaborators_read" on public.wishlist_collaborators
  for select using (
    exists (
      select 1 from public.wishlist_collaborators wc
      where wc.wishlist_id = wishlist_id and wc.user_id = auth.uid()
    ) or exists (
      select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()
    )
  );
create policy if not exists "wishlist_collaborators_manage" on public.wishlist_collaborators
  for all using (
    exists (
      select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()
    )
  );

-- Reports
create policy if not exists "reports_insert" on public.reports
  for insert with check (reporter_id = auth.uid());
create policy if not exists "reports_view_own" on public.reports
  for select using (reporter_id = auth.uid());
create policy if not exists "reports_admin_manage" on public.reports
  for all using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  ) with check (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Exchange rates (admin manage, public read)
create policy if not exists "exchange_rates_read" on public.exchange_rates
  for select using (true);
create policy if not exists "exchange_rates_admin_manage" on public.exchange_rates
  for all using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  ) with check (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- External calendars (hosts only)
create policy if not exists "external_calendars_host_access" on public.external_calendars
  for all using (
    exists (
      select 1 from public.listings l where l.id = listing_id and l.host_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.listings l where l.id = listing_id and l.host_id = auth.uid()
    )
  );

-- Audit logs
create policy if not exists "audit_logs_admin_read" on public.audit_logs
  for select using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );
create policy if not exists "audit_logs_insert_actor" on public.audit_logs
  for insert with check (
    auth.uid() = user_id or user_id is null or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );
