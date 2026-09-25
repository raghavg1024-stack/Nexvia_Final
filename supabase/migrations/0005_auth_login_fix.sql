-- ---------------------------------------------------------------------------
-- 0005: Fix login for new signups
--
-- Supabase Auth has "Confirm email" enabled, so new users cannot log in until
-- they click the confirmation link. This trigger auto-confirms every new
-- email signup so login works immediately after signup.
--
-- NOTE: The clean fix is to disable "Confirm email" in the dashboard
-- (Authentication -> Sign In / Providers -> Email). This trigger makes the
-- same behavior apply at the database level without dashboard access.
-- Drop the trigger once the dashboard setting is changed.
-- ---------------------------------------------------------------------------

create or replace function "public"."auto_confirm_email" ()
returns trigger
language plpgsql
security definer
set search_path = auth
as $$
begin
  if new.email_confirmed_at is null and new.email is not null then
    new.email_confirmed_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists "on_auth_user_auto_confirm" on auth.users;
create trigger "on_auth_user_auto_confirm"
  before insert on auth.users
  for each row
  execute function "public"."auto_confirm_email" ();