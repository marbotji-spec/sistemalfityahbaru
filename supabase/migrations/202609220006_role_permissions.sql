create or replace function public.is_education_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_any_role(array['ADMIN', 'GURU', 'KETUA_TPA', 'KETUA_TAHFIZ']::public.app_role[]);
$$;

create or replace function public.is_tpa_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_any_role(array['ADMIN', 'GURU', 'KETUA_TPA']::public.app_role[]);
$$;

create or replace function public.is_tahfiz_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_any_role(array['ADMIN', 'GURU', 'KETUA_TAHFIZ']::public.app_role[]);
$$;
