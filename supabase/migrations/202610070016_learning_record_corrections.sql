drop policy if exists "Education staff can correct attendance in scope" on public.student_attendance;
create policy "Education staff can correct attendance in scope"
on public.student_attendance for update to authenticated
using (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or (exists (select 1 from public.students s where s.id = student_id and s.branch = 'GOWA')
      and public.has_any_role(array['GURU', 'GURU_TPA', 'GURU_TAHFIDZH', 'KETUA_TPA', 'KETUA_TAHFIDZH']::public.app_role[]))
)
with check (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or (exists (select 1 from public.students s where s.id = student_id and s.branch = 'GOWA')
      and public.has_any_role(array['GURU', 'GURU_TPA', 'GURU_TAHFIDZH', 'KETUA_TPA', 'KETUA_TAHFIDZH']::public.app_role[]))
);

drop policy if exists "Education staff can correct GOWA reading assessments" on public.reading_assessments;
create policy "Education staff can correct GOWA reading assessments"
on public.reading_assessments for update to authenticated
using (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or (exists (select 1 from public.students s where s.id = student_id and s.branch = 'GOWA')
      and public.has_any_role(array['GURU', 'GURU_TPA', 'KETUA_TPA']::public.app_role[]))
)
with check (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or (exists (select 1 from public.students s where s.id = student_id and s.branch = 'GOWA')
      and public.has_any_role(array['GURU', 'GURU_TPA', 'KETUA_TPA']::public.app_role[]))
);

drop policy if exists "Education staff can correct GOWA memorization" on public.memorization_records;
create policy "Education staff can correct GOWA memorization"
on public.memorization_records for update to authenticated
using (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or (exists (select 1 from public.students s where s.id = student_id and s.branch = 'GOWA')
      and public.has_any_role(array['GURU', 'GURU_TAHFIDZH', 'KETUA_TAHFIDZH']::public.app_role[]))
)
with check (
  public.has_any_role(array['ADMIN', 'KETUA_YAYASAN']::public.app_role[])
  or (exists (select 1 from public.students s where s.id = student_id and s.branch = 'GOWA')
      and public.has_any_role(array['GURU', 'GURU_TAHFIDZH', 'KETUA_TAHFIDZH']::public.app_role[]))
);

update public.students s
set public_code = regexp_replace(s.public_code, '^TAHFIDZH-', 'TF-')
from public.programs p
where p.id = s.program_id and upper(p.name) like '%TAHFIDZH%'
  and s.public_code like 'TAHFIDZH-%';
