-- Buckets: 'avatars', 'listing-photos'
-- Storage RLS helper functions like storage.foldername(name) help scope paths. 
-- Create your buckets in the Dashboard, then apply these policies on storage.objects.

create policy if not exists "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');
create policy if not exists "avatars_user_write" on storage.objects for insert to authenticated
with check (bucket_id='avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy if not exists "avatars_user_update_delete" on storage.objects for update to authenticated
using (bucket_id='avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id='avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy if not exists "listing_photos_public_read" on storage.objects for select using (bucket_id = 'listing-photos');
create policy if not exists "listing_photos_host_write" on storage.objects for insert to authenticated
with check (bucket_id='listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy if not exists "listing_photos_host_update_delete" on storage.objects for update to authenticated
using (bucket_id='listing-photos' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id='listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
