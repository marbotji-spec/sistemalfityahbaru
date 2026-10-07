alter table public.students
  add column if not exists branch text not null default 'GOWA';

alter table public.registration_requests
  add column if not exists branch text not null default 'GOWA';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'students_branch_allowed'
  ) then
    alter table public.students add constraint students_branch_allowed
      check (branch in ('GOWA', 'BARRU', 'BULUKUMBA'));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'registration_requests_branch_allowed'
  ) then
    alter table public.registration_requests add constraint registration_requests_branch_allowed
      check (branch in ('GOWA', 'BARRU', 'BULUKUMBA'));
  end if;
end;
$$;

create index if not exists students_branch_program_status_idx
  on public.students(branch, program_id, status);

-- Old student records default to GOWA because all existing teachers are scoped there.
drop policy if exists "Authenticated users can view students" on public.students;
drop policy if exists "Staff can view students within branch scope" on public.students;
create policy "Staff can view students within branch scope"
on public.students for select to authenticated
using (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or branch = 'GOWA'
);

-- Non-admin teaching staff may record or read learning data only for GOWA students.
drop policy if exists "Internal can read reading assessments" on public.reading_assessments;
create policy "Staff can read reading assessments within branch scope"
on public.reading_assessments for select to authenticated
using (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or exists (select 1 from public.students s where s.id = student_id and s.branch = 'GOWA')
);

drop policy if exists "TPA roles can record reading assessments" on public.reading_assessments;
create policy "TPA staff can record GOWA reading assessments"
on public.reading_assessments for insert to authenticated
with check (
  created_by = auth.uid()
  and public.has_any_role(array['ADMIN', 'GURU', 'GURU_TPA', 'KETUA_TPA']::public.app_role[])
  and exists (select 1 from public.students s where s.id = student_id and (s.branch = 'GOWA' or public.has_any_role(array['ADMIN']::public.app_role[])))
);

drop policy if exists "Authors and administrators can correct reading assessments" on public.reading_assessments;
create policy "Authors can correct GOWA reading assessments"
on public.reading_assessments for update to authenticated
using (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or (created_by = auth.uid() and exists (select 1 from public.students s where s.id = student_id and s.branch = 'GOWA'))
)
with check (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or (created_by = auth.uid() and exists (select 1 from public.students s where s.id = student_id and s.branch = 'GOWA'))
);

drop policy if exists "Internal can read memorization records" on public.memorization_records;
create policy "Staff can read memorization within branch scope"
on public.memorization_records for select to authenticated
using (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or exists (select 1 from public.students s where s.id = student_id and s.branch = 'GOWA')
);

drop policy if exists "Tahfizh roles can record memorization" on public.memorization_records;
create policy "Tahfizh staff can record GOWA memorization"
on public.memorization_records for insert to authenticated
with check (
  created_by = auth.uid()
  and public.has_any_role(array['ADMIN', 'GURU', 'GURU_TAHFIDZH', 'KETUA_TAHFIDZH']::public.app_role[])
  and exists (select 1 from public.students s where s.id = student_id and (s.branch = 'GOWA' or public.has_any_role(array['ADMIN']::public.app_role[])))
);

drop policy if exists "Authors and administrators can correct memorization records" on public.memorization_records;
create policy "Authors can correct GOWA memorization"
on public.memorization_records for update to authenticated
using (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or (created_by = auth.uid() and exists (select 1 from public.students s where s.id = student_id and s.branch = 'GOWA'))
)
with check (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or (created_by = auth.uid() and exists (select 1 from public.students s where s.id = student_id and s.branch = 'GOWA'))
);

drop policy if exists "Internal can read student attendance" on public.student_attendance;
create policy "Staff can read attendance within branch scope"
on public.student_attendance for select to authenticated
using (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or exists (select 1 from public.students s where s.id = student_id and s.branch = 'GOWA')
);

drop policy if exists "Education staff can record student attendance" on public.student_attendance;
create policy "Education staff can record GOWA attendance"
on public.student_attendance for insert to authenticated
with check (
  created_by = auth.uid()
  and public.has_any_role(array['ADMIN', 'GURU', 'GURU_TPA', 'GURU_TAHFIDZH', 'KETUA_TPA', 'KETUA_TAHFIDZH']::public.app_role[])
  and exists (select 1 from public.students s where s.id = student_id and (s.branch = 'GOWA' or public.has_any_role(array['ADMIN']::public.app_role[])))
);

drop policy if exists "Authors and administrators can correct student attendance" on public.student_attendance;
create policy "Authors can correct GOWA attendance"
on public.student_attendance for update to authenticated
using (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or (created_by = auth.uid() and exists (select 1 from public.students s where s.id = student_id and s.branch = 'GOWA'))
)
with check (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or (created_by = auth.uid() and exists (select 1 from public.students s where s.id = student_id and s.branch = 'GOWA'))
);
