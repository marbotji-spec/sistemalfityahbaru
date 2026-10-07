create type public.teacher_attendance_status as enum ('HADIR', 'IZIN', 'SAKIT', 'ALPA', 'CUTI');

create table public.teacher_attendance (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id),
  attendance_date date not null default current_date,
  session_name text not null default 'Sesi 1',
  status public.teacher_attendance_status not null,
  method text not null default 'MANUAL' check (method in ('MANUAL', 'OTOMATIS')),
  source_activity text,
  source_record_id uuid,
  note text,
  created_by uuid not null references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (teacher_id, attendance_date, session_name)
);

create index teacher_attendance_date_idx on public.teacher_attendance(attendance_date desc);

create trigger teacher_attendance_set_updated_at
before update on public.teacher_attendance
for each row execute procedure public.set_updated_at();

alter table public.teacher_attendance enable row level security;

create policy "Staff can read own or supervised teacher attendance"
on public.teacher_attendance for select to authenticated
using (
  teacher_id = auth.uid()
  or public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
);

create policy "Admin and chair can mark teacher attendance"
on public.teacher_attendance for insert to authenticated
with check (
  created_by = auth.uid()
  and public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
);

create policy "Teachers can mark their own attendance"
on public.teacher_attendance for insert to authenticated
with check (teacher_id = auth.uid() and created_by = auth.uid());

create policy "Admin, chair, or teacher can correct authorized attendance"
on public.teacher_attendance for update to authenticated
using (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or (teacher_id = auth.uid() and created_by = auth.uid())
)
with check (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or (teacher_id = auth.uid() and created_by = auth.uid())
);

grant select, insert, update on public.teacher_attendance to authenticated;

-- Old Tahfidzh student codes were generated with a program-name prefix; normalize those to TF.
update public.students s
set public_code = regexp_replace(s.public_code, '^TAHFIDZH-', 'TF-')
from public.programs p
where p.id = s.program_id
  and upper(p.name) like '%TAHFIDZH%'
  and s.public_code like 'TAHFIDZH-%';
