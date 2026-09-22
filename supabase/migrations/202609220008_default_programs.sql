insert into public.programs (name, description, is_active)
select 'TPA', 'Taman Pendidikan Al-Qur''an', true
where not exists (select 1 from public.programs where upper(name) = 'TPA');

insert into public.programs (name, description, is_active)
select 'TAHFIDZH', 'Program hafalan Al-Qur''an', true
where not exists (select 1 from public.programs where upper(name) = 'TAHFIDZH');
