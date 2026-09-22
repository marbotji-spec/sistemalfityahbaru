alter table public.students add column if not exists nis text;
create unique index if not exists students_nis_unique on public.students (nis) where nis is not null and nis <> '';

create table public.registration_requests (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  guardian_name text,
  guardian_phone text,
  program_id uuid references public.programs(id),
  notes text,
  status text not null default 'MENUNGGU' check (status in ('MENUNGGU', 'DITINJAU', 'DITERIMA', 'DITOLAK')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.registration_requests enable row level security;

create policy "Public can submit registration requests"
on public.registration_requests for insert to anon, authenticated
with check (status = 'MENUNGGU');

create policy "Public can view active programs"
on public.programs for select to anon
using (is_active = true);

create policy "Internal users can view registration requests"
on public.registration_requests for select to authenticated
using (public.is_admin_or_chair());

grant insert on public.registration_requests to anon, authenticated;
grant select, update on public.registration_requests to authenticated;
