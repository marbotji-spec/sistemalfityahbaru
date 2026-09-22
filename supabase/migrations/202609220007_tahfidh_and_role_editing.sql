alter type public.app_role add value if not exists 'KETUA_TAHFIDZH';

create or replace function public.is_tahfizh_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_any_role(array['ADMIN', 'GURU', 'KETUA_TAHFIDZH']::public.app_role[]);
$$;

create or replace function public.is_admin_or_chair()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[]);
$$;

-- Existing KETUA_TAHFIZ values remain readable for backward compatibility.
-- New assignments should use KETUA_TAHFIDZH.
drop policy if exists "Admins can manage user roles" on public.user_roles;
create policy "Admins and chair can manage user roles"
on public.user_roles for all to authenticated
using (public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[]))
with check (public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[]));
