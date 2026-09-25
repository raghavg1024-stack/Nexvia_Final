-- Career OS — storage for avatars
-- Migration 0002: creates a public `avatars` bucket with public read
-- and owner-only write (storage RLS policies).

-- Public bucket for user avatar images.
insert into "storage"."buckets" ("id", "name", "public")
values ('avatars', 'avatars', true)
on conflict ("id") do nothing;

-- Public read: anyone may read objects in the bucket.
drop policy if exists "avatars_public_read" on "storage"."objects";
create policy "avatars_public_read" on "storage"."objects"
  for select using ("bucket_id" = 'avatars');

-- Write access is restricted to the object owner (authenticated user).
drop policy if exists "avatars_owner_insert" on "storage"."objects";
create policy "avatars_owner_insert" on "storage"."objects"
  for insert to authenticated
  with check ("bucket_id" = 'avatars' and auth.uid () = "owner");

drop policy if exists "avatars_owner_update" on "storage"."objects";
create policy "avatars_owner_update" on "storage"."objects"
  for update to authenticated
  using ("bucket_id" = 'avatars' and auth.uid () = "owner")
  with check ("bucket_id" = 'avatars' and auth.uid () = "owner");

drop policy if exists "avatars_owner_delete" on "storage"."objects";
create policy "avatars_owner_delete" on "storage"."objects"
  for delete to authenticated
  using ("bucket_id" = 'avatars' and auth.uid () = "owner");