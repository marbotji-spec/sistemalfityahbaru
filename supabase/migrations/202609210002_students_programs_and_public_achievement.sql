create type public.student_gender as enum ('L', 'P');
create type public.student_status as enum ('AKTIF', 'LULUS', 'PINDAH', 'NONAKTIF');

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid references public.profiles(id)
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id),
  name text not null,
  teacher_id uuid references public.profiles(id),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  unique(program_id, name)
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique,
  full_name text not null,
  nickname text,
  gender public.student_gender,
  birth_place text,
  birth_date date,
  guardian_name text,
  guardian_phone text,
  address text,
  program_id uuid references public.programs(id),
  class_id uuid references public.classes(id),
  entry_year integer,
  status public.student_status not null default 'AKTIF',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id)
);

create table public.student_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  content text not null,
  category text,
  publish_to_parent boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid not null references public.profiles(id)
);

create table public.student_achievements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  period_label text not null,
  attendance_present integer not null default 0,
  attendance_excused integer not null default 0,
  attendance_sick integer not null default 0,
  attendance_absent integer not null default 0,
  tpa_status text,
  tajwid_summary text,
  makhraj_summary text,
  fluency_summary text,
  memorization_total text,
  last_surah text,
  last_verse text,
  memorization_status text,
  payment_status text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(student_id, period_label)
);

create trigger students_set_updated_at
before update on public.students
for each row execute procedure public.set_updated_at();

create trigger achievements_set_updated_at
before update on public.student_achievements
for each row execute procedure public.set_updated_at();

alter table public.programs enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.student_notes enable row level security;
alter table public.student_achievements enable row level security;

create policy "Authenticated users can view programs"
on public.programs for select to authenticated using (true);
create policy "Admins can manage programs"
on public.programs for all to authenticated using (public.has_role('ADMIN')) with check (public.has_role('ADMIN'));

create policy "Authenticated users can view classes"
on public.classes for select to authenticated using (true);
create policy "Admins and chair can manage classes"
on public.classes for all to authenticated using (public.is_admin_or_chair()) with check (public.is_admin_or_chair());

create policy "Authenticated users can view students"
on public.students for select to authenticated using (true);
create policy "Authenticated users can create students"
on public.students for insert to authenticated with check (created_by = auth.uid());
create policy "Users can update students"
on public.students for update to authenticated using (created_by = auth.uid() or public.is_admin_or_chair()) with check (created_by = auth.uid() or public.is_admin_or_chair());

create policy "Internal users can view notes"
on public.student_notes for select to authenticated using (true);
create policy "Users can create notes"
on public.student_notes for insert to authenticated with check (created_by = auth.uid());
create policy "Authors and admins can update notes"
on public.student_notes for update to authenticated using (created_by = auth.uid() or public.is_admin_or_chair()) with check (created_by = auth.uid() or public.is_admin_or_chair());

create policy "Internal users can view achievements"
on public.student_achievements for select to authenticated using (true);
create policy "Admins and teachers can manage achievements"
on public.student_achievements for all to authenticated using (public.current_user_role() in ('ADMIN', 'GURU')) with check (public.current_user_role() in ('ADMIN', 'GURU'));

grant select on public.programs, public.classes, public.students, public.student_notes, public.student_achievements to anon, authenticated;
grant insert, update on public.students, public.student_notes, public.student_achievements to authenticated;
grant insert, update, delete on public.programs, public.classes to authenticated;

create or replace function public.get_public_achievement(lookup_code text)
returns table (
  student_name text,
  program_name text,
  class_name text,
  period_label text,
  attendance_present integer,
  attendance_excused integer,
  attendance_sick integer,
  attendance_absent integer,
  tpa_status text,
  tajwid_summary text,
  makhraj_summary text,
  fluency_summary text,
  memorization_total text,
  last_surah text,
  last_verse text,
  memorization_status text,
  payment_status text,
  public_notes jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select s.full_name, p.name, c.name, a.period_label,
    a.attendance_present, a.attendance_excused, a.attendance_sick, a.attendance_absent,
    a.tpa_status, a.tajwid_summary, a.makhraj_summary, a.fluency_summary,
    a.memorization_total, a.last_surah, a.last_verse, a.memorization_status, a.payment_status,
    coalesce((select jsonb_agg(jsonb_build_object('content', n.content, 'category', n.category, 'created_at', n.created_at) order by n.created_at desc)
      from public.student_notes n where n.student_id = s.id and n.publish_to_parent = true), '[]'::jsonb)
  from public.students s
  left join public.programs p on p.id = s.program_id
  left join public.classes c on c.id = s.class_id
  left join lateral (select * from public.student_achievements sa where sa.student_id = s.id order by sa.updated_at desc limit 1) a on true
  where s.public_code = upper(trim(lookup_code)) and s.status = 'AKTIF'
  limit 1;
$$;

grant execute on function public.get_public_achievement(text) to anon, authenticated;
