alter type public.app_role add value if not exists 'GURU_TPA';
alter type public.app_role add value if not exists 'GURU_TAHFIDZH';

create or replace function public.is_tpa_manager()
returns boolean
language sql stable security definer set search_path = public
as $$ select public.has_any_role(array['ADMIN', 'GURU', 'GURU_TPA', 'KETUA_TPA']::public.app_role[]); $$;

create or replace function public.is_tahfizh_manager()
returns boolean
language sql stable security definer set search_path = public
as $$ select public.has_any_role(array['ADMIN', 'GURU', 'GURU_TAHFIDZH', 'KETUA_TAHFIDZH']::public.app_role[]); $$;
