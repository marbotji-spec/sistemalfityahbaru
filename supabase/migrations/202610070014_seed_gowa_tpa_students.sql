insert into public.programs (name, description, is_active)
select 'TPA', 'Taman Pendidikan Al-Qur''an', true
where not exists (select 1 from public.programs where upper(name) = 'TPA');

insert into public.students (public_code, full_name, gender, program_id, branch, status)
select
  source.public_code,
  source.full_name,
  source.gender::public.student_gender,
  program.id,
  'GOWA',
  'AKTIF'
from (values
  ('TPA-2026-GOWA-001', 'Abidzar', 'L'),
  ('TPA-2026-GOWA-002', 'Abidzar', 'L'),
  ('TPA-2026-GOWA-003', 'Adam', 'L'),
  ('TPA-2026-GOWA-004', 'Adeeva', 'P'),
  ('TPA-2026-GOWA-005', 'Afifah', 'P'),
  ('TPA-2026-GOWA-006', 'Afiqah', 'P'),
  ('TPA-2026-GOWA-007', 'Aira', 'P'),
  ('TPA-2026-GOWA-008', 'Ainun', 'P'),
  ('TPA-2026-GOWA-009', 'Airin', 'P'),
  ('TPA-2026-GOWA-010', 'Aisyah', 'P'),
  ('TPA-2026-GOWA-011', 'Akila', 'P'),
  ('TPA-2026-GOWA-012', 'Akilah', 'P'),
  ('TPA-2026-GOWA-013', 'Alfarezy', 'L'),
  ('TPA-2026-GOWA-014', 'Alvian', 'L'),
  ('TPA-2026-GOWA-015', 'Annisa', 'P'),
  ('TPA-2026-GOWA-016', 'Aqilah', 'P'),
  ('TPA-2026-GOWA-017', 'Arfan', 'L'),
  ('TPA-2026-GOWA-018', 'Aura', 'P'),
  ('TPA-2026-GOWA-019', 'Azka', 'L'),
  ('TPA-2026-GOWA-020', 'Chelsea', 'P'),
  ('TPA-2026-GOWA-021', 'Dafa', 'L'),
  ('TPA-2026-GOWA-022', 'Dafi', 'L'),
  ('TPA-2026-GOWA-023', 'Dilan', 'P'),
  ('TPA-2026-GOWA-024', 'Dilla', 'P'),
  ('TPA-2026-GOWA-025', 'Dinra', 'P'),
  ('TPA-2026-GOWA-026', 'Dzakyiah', 'P'),
  ('TPA-2026-GOWA-027', 'Faiz', 'L'),
  ('TPA-2026-GOWA-028', 'Galih', 'L'),
  ('TPA-2026-GOWA-029', 'Habibi', 'L'),
  ('TPA-2026-GOWA-030', 'Hanum', 'P'),
  ('TPA-2026-GOWA-031', 'Ibas', 'L'),
  ('TPA-2026-GOWA-032', 'Ikram', 'L'),
  ('TPA-2026-GOWA-033', 'Indira', 'P'),
  ('TPA-2026-GOWA-034', 'Jafar', 'L'),
  ('TPA-2026-GOWA-035', 'Kaisar', 'L'),
  ('TPA-2026-GOWA-036', 'Kirana', 'P'),
  ('TPA-2026-GOWA-037', 'Mahirah', 'P'),
  ('TPA-2026-GOWA-038', 'Muh.', 'L'),
  ('TPA-2026-GOWA-039', 'Nabila', 'P'),
  ('TPA-2026-GOWA-040', 'Naila', 'P'),
  ('TPA-2026-GOWA-041', 'Najwa', 'P'),
  ('TPA-2026-GOWA-042', 'Nasafah', 'P'),
  ('TPA-2026-GOWA-043', 'Nasifah', 'P'),
  ('TPA-2026-GOWA-044', 'Rahma', 'P'),
  ('TPA-2026-GOWA-045', 'Rayyan', 'L'),
  ('TPA-2026-GOWA-046', 'Razak', 'L'),
  ('TPA-2026-GOWA-047', 'Reski', 'L'),
  ('TPA-2026-GOWA-048', 'Risda', 'P'),
  ('TPA-2026-GOWA-049', 'Riska', 'P'),
  ('TPA-2026-GOWA-050', 'Syafiq', 'P'),
  ('TPA-2026-GOWA-051', 'Syakilah', 'P'),
  ('TPA-2026-GOWA-052', 'Taliyah', 'P'),
  ('TPA-2026-GOWA-053', 'Wawan', 'L'),
  ('TPA-2026-GOWA-054', 'Zahra', 'P'),
  ('TPA-2026-GOWA-055', 'Zaidan', 'L')
) as source(public_code, full_name, gender)
join lateral (
  select id from public.programs where upper(name) = 'TPA' and is_active = true limit 1
) as program on true
on conflict (public_code) do nothing;
