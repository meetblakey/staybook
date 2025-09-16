-- Sample data for local development
insert into public.profiles (id, full_name, avatar_url, role)
values
  ('11111111-1111-1111-1111-111111111111', 'Jess Host', null, 'host'),
  ('22222222-2222-2222-2222-222222222222', 'Mo Host', null, 'host'),
  ('33333333-3333-3333-3333-333333333333', 'Ari Guest', null, 'guest'),
  ('44444444-4444-4444-4444-444444444444', 'Lou Guest', null, 'guest')
on conflict (id) do nothing;

insert into public.listings (
  id,
  host_id,
  title,
  description,
  property_type,
  room_type,
  max_guests,
  bedrooms,
  beds,
  bathrooms,
  price_nightly,
  cleaning_fee,
  service_fee,
  currency,
  address_line1,
  city,
  country,
  location,
  amenities,
  status
) values
  (
    '6d94cf15-3477-4a4f-9ebd-9f8d60124d80',
    '11111111-1111-1111-1111-111111111111',
    'Alfama rooftop loft',
    'Watch the sunrise over Lisbon with floor-to-ceiling windows and a private terrace.',
    'Apartment',
    'Entire place',
    4,
    2,
    2,
    1.5,
    180,
    30,
    20,
    'EUR',
    'Rua do Salvador 15',
    'Lisbon',
    'Portugal',
    st_setsrid(st_makepoint(-9.131, 38.711), 4326),
    '["Wifi","Kitchen","Air conditioning","Dedicated workspace","EV charger"]',
    'published'
  ),
  (
    '9fa2b7a3-16f9-45cb-a9a1-c4e26c3b0faa',
    '22222222-2222-2222-2222-222222222222',
    'Modern Kyoto machiya',
    'Restored townhouse blending tatami floors with soaking tub and zen courtyard.',
    'Townhouse',
    'Entire place',
    5,
    3,
    4,
    2,
    210,
    40,
    25,
    'JPY',
    'Sakyo Ward',
    'Kyoto',
    'Japan',
    st_setsrid(st_makepoint(135.772, 35.015), 4326),
    '["Wifi","Kitchen","Washer","Hot tub","Garden"]',
    'published'
  ),
  (
    'a32b4fd0-5a51-4d20-b39a-4b6f4a5da72e',
    '11111111-1111-1111-1111-111111111111',
    'High-desert container home',
    'Sustainable desert escape with starry-night views and outdoor soaking tub.',
    'Tiny home',
    'Entire place',
    2,
    1,
    1,
    1,
    145,
    20,
    15,
    'USD',
    'Joshua Tree',
    'Joshua Tree',
    'United States',
    st_setsrid(st_makepoint(-116.313, 34.134), 4326),
    '["Wifi","Kitchen","Outdoor shower","Parking"]',
    'published'
  )
on conflict (id) do nothing;

insert into public.listing_photos (id, listing_id, path, sort_order)
values
  ('f3f531d3-fe9f-4ae3-a53f-0b3df9872201', '6d94cf15-3477-4a4f-9ebd-9f8d60124d80', 'demo/lisbon/hero.jpg', 1),
  ('aa0be2b2-bf74-4b11-a3cf-8002972c4640', '6d94cf15-3477-4a4f-9ebd-9f8d60124d80', 'demo/lisbon/living.jpg', 2),
  ('32d9b0f5-0a55-4d66-a251-84295f2cf4fb', '9fa2b7a3-16f9-45cb-a9a1-c4e26c3b0faa', 'demo/kyoto/hero.jpg', 1),
  ('d04f6416-6e55-4e43-a439-c9b8e47bfba0', 'a32b4fd0-5a51-4d20-b39a-4b6f4a5da72e', 'demo/desert/hero.jpg', 1)
on conflict (id) do nothing;

insert into public.bookings (id, listing_id, guest_id, kind, date_range, guests_count, total_price, status, payment_status)
values
  (
    'd88152af-d905-4c7e-8df9-1b4032adff64',
    '6d94cf15-3477-4a4f-9ebd-9f8d60124d80',
    '33333333-3333-3333-3333-333333333333',
    'booking',
    daterange('2024-11-03','2024-11-08','[)'),
    2,
    920,
    'confirmed',
    'paid'
  ),
  (
    '78f7a1f8-c64d-46a4-b7fd-93932be40f56',
    '9fa2b7a3-16f9-45cb-a9a1-c4e26c3b0faa',
    '44444444-4444-4444-4444-444444444444',
    'booking',
    daterange('2024-12-20','2024-12-27','[)'),
    3,
    1680,
    'pending',
    'test'
  )
on conflict (id) do nothing;

insert into public.reviews (id, booking_id, listing_id, author_id, target_user_id, overall, cleanliness, accuracy, comment)
values
  (
    '2228fab5-1dc1-4fc2-9f80-8745096930e2',
    'd88152af-d905-4c7e-8df9-1b4032adff64',
    '6d94cf15-3477-4a4f-9ebd-9f8d60124d80',
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    5,
    5,
    5,
    'Incredible views and thoughtful touches throughout the loft.'
  )
on conflict (id) do nothing;
