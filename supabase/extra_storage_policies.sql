-- Message attachments bucket policies
create policy if not exists "message_attachments_read" on storage.objects
  for select using (
    bucket_id = 'message-attachments'
    and exists (
      select 1 from public.messages m
      join public.threads t on t.id = m.thread_id
      where m.thread_id = (storage.foldername(name))[1]::uuid
        and (
          t.host_id = auth.uid() or t.guest_id = auth.uid()
        )
    )
  );

create policy if not exists "message_attachments_user_write" on storage.objects
  for insert with check (
    bucket_id = 'message-attachments'
    and (storage.foldername(name))[1]::uuid is not null
    and (storage.foldername(name))[2] = auth.uid()::text
    and exists (
      select 1 from public.threads t
      where t.id = (storage.foldername(name))[1]::uuid
        and (
          t.host_id = auth.uid() or t.guest_id = auth.uid()
        )
    )
  );

create policy if not exists "message_attachments_user_update" on storage.objects
  for update using (
    bucket_id = 'message-attachments'
    and (storage.foldername(name))[2] = auth.uid()::text
  ) with check (
    bucket_id = 'message-attachments'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy if not exists "message_attachments_user_delete" on storage.objects
  for delete using (
    bucket_id = 'message-attachments'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- Verification documents bucket policies
create policy if not exists "verifications_owner_read" on storage.objects
  for select using (
    bucket_id = 'verifications'
    and ((storage.foldername(name))[1] = auth.uid()::text or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    ))
  );

create policy if not exists "verifications_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'verifications'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy if not exists "verifications_owner_update" on storage.objects
  for update using (
    bucket_id = 'verifications'
    and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'verifications'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy if not exists "verifications_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'verifications'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
