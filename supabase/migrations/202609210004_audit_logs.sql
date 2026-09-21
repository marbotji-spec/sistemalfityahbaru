create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  role public.app_role,
  action text not null,
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.audit_logs enable row level security;

create policy "Admins and chair can view audit logs"
on public.audit_logs for select to authenticated
using (public.is_admin_or_chair());

grant select on public.audit_logs to authenticated;
