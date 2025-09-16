# Staybook Agent Notes

## Core commands
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm run seed`

## Verification checklist
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Manual: Map loads without SSR errors (Leaflet client-only)
- Manual: Booking range creation respects Postgres EXCLUDE constraint
- Manual: Flow — signup/login → create listing → publish → search + map → reserve (FakePay) → confirm
- Manual: Supabase RLS — guest cannot read other bookings; host can see bookings for own listings
