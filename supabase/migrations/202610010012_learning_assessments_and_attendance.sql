create type public.reading_material_type as enum ('IQRA', 'QURAN');
create type public.memorization_session_type as enum ('ZIYADAH', 'MURAJAAH');
create type public.learning_progress_status as enum ('TURUN', 'MENGULANG', 'LANJUT');
create type public.student_attendance_status as enum ('HADIR', 'IZIN', 'SAKIT', 'ALPA');

create table public.reading_assessments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  program_id uuid references public.programs(id),
  class_id uuid references public.classes(id),
  assessment_date date not null default current_date,
  material_type public.reading_material_type not null,
  iqra_level text,
  page_start integer,
  page_end integer,
  surah_name text,
  verse_start integer,
  verse_end integer,
  fluency_score smallint,
  tajwid_score smallint,
  makhraj_score smallint,
  length_score smallint,
  waqaf_score smallint,
  adab_score smallint,
  overall_score smallint not null check (overall_score between 1 and 100),
  progress_status public.learning_progress_status generated always as (
    case when overall_score < 50 then 'TURUN'::public.learning_progress_status
         when overall_score < 70 then 'MENGULANG'::public.learning_progress_status
         else 'LANJUT'::public.learning_progress_status end
  ) stored,
  teacher_note text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  constraint reading_score_ranges check (
    (fluency_score is null or fluency_score between 1 and 100) and
    (tajwid_score is null or tajwid_score between 1 and 100) and
    (makhraj_score is null or makhraj_score between 1 and 100) and
    (length_score is null or length_score between 1 and 100) and
    (waqaf_score is null or waqaf_score between 1 and 100) and
    (adab_score is null or adab_score between 1 and 100)
  ),
  constraint reading_pages_valid check (page_start is null or page_start > 0 and (page_end is null or page_end >= page_start)),
  constraint reading_verses_valid check (verse_start is null or verse_start > 0 and (verse_end is null or verse_end >= verse_start))
);

create table public.memorization_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  program_id uuid references public.programs(id),
  class_id uuid references public.classes(id),
  session_date date not null default current_date,
  session_type public.memorization_session_type not null,
  surah_name text not null,
  verse_start integer not null check (verse_start > 0),
  verse_end integer not null check (verse_end >= verse_start),
  page_start integer,
  page_end integer,
  fluency_score smallint,
  tajwid_score smallint,
  makhraj_score smallint,
  overall_score smallint not null check (overall_score between 1 and 100),
  progress_status public.learning_progress_status generated always as (
    case when overall_score < 50 then 'TURUN'::public.learning_progress_status
         when overall_score < 70 then 'MENGULANG'::public.learning_progress_status
         else 'LANJUT'::public.learning_progress_status end
  ) stored,
  teacher_note text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  constraint memorization_score_ranges check (
    (fluency_score is null or fluency_score between 1 and 100) and
    (tajwid_score is null or tajwid_score between 1 and 100) and
    (makhraj_score is null or makhraj_score between 1 and 100)
  ),
  constraint memorization_pages_valid check (page_start is null or page_start > 0 and (page_end is null or page_end >= page_start))
);

create table public.student_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  program_id uuid references public.programs(id),
  class_id uuid references public.classes(id),
  attendance_date date not null default current_date,
  session_name text not null default 'Sesi 1',
  status public.student_attendance_status not null,
  note text,
  created_by uuid not null references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(student_id, attendance_date, session_name)
);

create index reading_assessments_student_date_idx on public.reading_assessments(student_id, assessment_date desc);
create index memorization_records_student_date_idx on public.memorization_records(student_id, session_date desc);
create index student_attendance_date_idx on public.student_attendance(attendance_date desc);

create trigger student_attendance_set_updated_at
before update on public.student_attendance
for each row execute procedure public.set_updated_at();

alter table public.reading_assessments enable row level security;
alter table public.memorization_records enable row level security;
alter table public.student_attendance enable row level security;

create policy "Internal can read reading assessments" on public.reading_assessments
for select to authenticated using (true);
create policy "TPA roles can record reading assessments" on public.reading_assessments
for insert to authenticated with check (
  created_by = auth.uid() and public.has_any_role(array['ADMIN','GURU','GURU_TPA','KETUA_TPA']::public.app_role[])
);
create policy "Authors and administrators can correct reading assessments" on public.reading_assessments
for update to authenticated using (created_by = auth.uid() or public.is_admin_or_chair())
with check (created_by = auth.uid() or public.is_admin_or_chair());

create policy "Internal can read memorization records" on public.memorization_records
for select to authenticated using (true);
create policy "Tahfizh roles can record memorization" on public.memorization_records
for insert to authenticated with check (
  created_by = auth.uid() and public.has_any_role(array['ADMIN','GURU','GURU_TAHFIDZH','KETUA_TAHFIDZH']::public.app_role[])
);
create policy "Authors and administrators can correct memorization records" on public.memorization_records
for update to authenticated using (created_by = auth.uid() or public.is_admin_or_chair())
with check (created_by = auth.uid() or public.is_admin_or_chair());

create policy "Internal can read student attendance" on public.student_attendance
for select to authenticated using (true);
create policy "Education staff can record student attendance" on public.student_attendance
for insert to authenticated with check (
  created_by = auth.uid() and public.has_any_role(array['ADMIN','GURU','GURU_TPA','GURU_TAHFIDZH','KETUA_TPA','KETUA_TAHFIDZH']::public.app_role[])
);
create policy "Authors and administrators can correct student attendance" on public.student_attendance
for update to authenticated using (created_by = auth.uid() or public.is_admin_or_chair())
with check (created_by = auth.uid() or public.is_admin_or_chair());

grant select, insert, update on public.reading_assessments, public.memorization_records, public.student_attendance to authenticated;
