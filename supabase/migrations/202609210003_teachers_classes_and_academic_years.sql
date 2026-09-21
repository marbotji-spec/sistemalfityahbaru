create type public.academic_period_status as enum ('AKTIF', 'NONAKTIF');

create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  address text,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid references public.profiles(id)
);

create table public.academic_years (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  status public.academic_period_status not null default 'NONAKTIF',
  starts_on date not null,
  ends_on date not null,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid references public.profiles(id),
  constraint academic_year_dates_valid check (ends_on > starts_on)
);

create table public.teacher_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  starts_on date,
  ends_on date,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid references public.profiles(id),
  unique(teacher_id, class_id)
);

alter table public.guardians enable row level security;
alter table public.academic_years enable row level security;
alter table public.teacher_assignments enable row level security;

create policy "Internal users can view guardians"
on public.guardians for select to authenticated using (true);
create policy "Users can create guardians"
on public.guardians for insert to authenticated with check (created_by = auth.uid());
create policy "Admins can manage guardians"
on public.guardians for all to authenticated using (public.has_role('ADMIN')) with check (public.has_role('ADMIN'));

create policy "Internal users can view academic years"
on public.academic_years for select to authenticated using (true);
create policy "Admins can manage academic years"
on public.academic_years for all to authenticated using (public.has_role('ADMIN')) with check (public.has_role('ADMIN'));

create policy "Internal users can view assignments"
on public.teacher_assignments for select to authenticated using (true);
create policy "Admins and chair can manage assignments"
on public.teacher_assignments for all to authenticated using (public.is_admin_or_chair()) with check (public.is_admin_or_chair());

grant select on public.guardians, public.academic_years, public.teacher_assignments to authenticated;
grant insert, update, delete on public.guardians, public.academic_years, public.teacher_assignments to authenticated;
