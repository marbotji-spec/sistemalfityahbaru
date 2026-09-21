create extension if not exists "pgcrypto";

create type public.app_role as enum ('ADMIN', 'GURU', 'KETUA_YAYASAN');
create type public.profile_status as enum ('AKTIF', 'NONAKTIF', 'CUTI');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  nickname text,
  phone text,
  email text,
  role public.app_role not null default 'GURU',
  status public.profile_status not null default 'AKTIF',
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = required_role;
$$;

create or replace function public.is_admin_or_chair()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('ADMIN', 'KETUA_YAYASAN');
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, 'Pengguna'), '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "Admins and chair can view all profiles"
on public.profiles for select
to authenticated
using (public.is_admin_or_chair());

create policy "Admins can insert profiles"
on public.profiles for insert
to authenticated
with check (public.has_role('ADMIN'));

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admins and chair can update profiles"
on public.profiles for update
to authenticated
using (public.is_admin_or_chair())
with check (public.is_admin_or_chair());

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
