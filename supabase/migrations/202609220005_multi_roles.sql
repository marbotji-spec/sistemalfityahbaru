alter type public.app_role add value if not exists 'KETUA_TPA';
alter type public.app_role add value if not exists 'KETUA_TAHFIZ';

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid references public.profiles(id),
  primary key (user_id, role)
);

create or replace function public.current_user_roles()
returns setof public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
  union
  select role from public.user_roles where user_id = auth.uid();
$$;

create or replace function public.has_any_role(required_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.current_user_roles() current_role
    where current_role = any(required_roles)
  );
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

alter table public.user_roles enable row level security;

create policy "Users can view their roles"
on public.user_roles for select to authenticated
using (user_id = auth.uid() or public.is_admin_or_chair());

create policy "Admins can manage user roles"
on public.user_roles for all to authenticated
using (public.has_role('ADMIN'))
with check (public.has_role('ADMIN'));

grant select on public.user_roles to authenticated;
grant insert, update, delete on public.user_roles to authenticated;
