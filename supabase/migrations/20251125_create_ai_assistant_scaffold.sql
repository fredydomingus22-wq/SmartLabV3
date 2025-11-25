-- AI Assistant scaffolding (placeholder-only, no external AI execution)
-- Stores runs, predictions, and feedback for IA-Engine compliant flows
-- Date: 2025-11-25

-- Helper view for factory access (tenant admins can see all factories in tenant)
create or replace view public.v_user_factory_access as
select fm.user_id,
       fm.factory_id,
       f.tenant_id
from public.factory_members fm
join public.factories f on f.id = fm.factory_id
union
select tm.user_id,
       f.id as factory_id,
       f.tenant_id
from public.tenant_members tm
join public.factories f on f.tenant_id = tm.tenant_id;

create table if not exists public.ai_runs (
  id uuid default uuid_generate_v4() primary key,
  prompt_type text check (prompt_type in ('deviation_prediction', 'why_analysis', 'quality_report', 'nl_query')) not null,
  input_ref jsonb default '{}'::jsonb,
  status text check (status in ('pending', 'running', 'succeeded', 'failed')) default 'pending',
  summary text,
  output jsonb,
  model_version text default 'placeholder',
  factory_id uuid references public.factories(id),
  tenant_id uuid references public.tenants(id),
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_ai_runs_factory on public.ai_runs(factory_id, created_at);
create index if not exists idx_ai_runs_tenant on public.ai_runs(tenant_id, created_at);

create table if not exists public.ai_predictions (
  id uuid default uuid_generate_v4() primary key,
  run_id uuid references public.ai_runs(id) on delete cascade,
  target_type text check (target_type in ('lot', 'line', 'parameter', 'equipment')),
  target_id uuid,
  predicted_risk numeric check (predicted_risk >= 0 and predicted_risk <= 1),
  explanation text,
  confidence numeric,
  window_start timestamp with time zone,
  window_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_ai_predictions_run on public.ai_predictions(run_id);

create table if not exists public.ai_feedback (
  id uuid default uuid_generate_v4() primary key,
  run_id uuid references public.ai_runs(id) on delete cascade,
  user_id uuid references public.profiles(id),
  rating integer check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_ai_feedback_run on public.ai_feedback(run_id);
create index if not exists idx_ai_feedback_user on public.ai_feedback(user_id);

-- RLS enablement
alter table public.ai_runs enable row level security;
alter table public.ai_predictions enable row level security;
alter table public.ai_feedback enable row level security;

-- AI Runs policies
create policy "ai_runs_select_member" on public.ai_runs
  for select to authenticated
  using (
    ai_runs.created_by = auth.uid()
    or (
      ai_runs.factory_id is not null and exists (
        select 1 from public.v_user_factory_access a
        where a.factory_id = ai_runs.factory_id and a.user_id = auth.uid()
      )
    )
    or (
      ai_runs.factory_id is null and ai_runs.tenant_id is not null and exists (
        select 1 from public.tenant_members tm
        where tm.tenant_id = ai_runs.tenant_id and tm.user_id = auth.uid()
      )
    )
  );

create policy "ai_runs_insert_member" on public.ai_runs
  for insert to authenticated
  with check (
    auth.uid() is not null
    and (
      ai_runs.factory_id is null
      or exists (
        select 1 from public.v_user_factory_access a
        where a.factory_id = ai_runs.factory_id and a.user_id = auth.uid()
      )
    )
  );

-- AI Predictions policies (inherit from run membership)
create policy "ai_predictions_select_member" on public.ai_predictions
  for select to authenticated
  using (
    exists (
      select 1 from public.ai_runs r
      where r.id = ai_predictions.run_id
      and (
        r.created_by = auth.uid()
        or (
          r.factory_id is not null and exists (
            select 1 from public.v_user_factory_access a
            where a.factory_id = r.factory_id and a.user_id = auth.uid()
          )
        )
        or (
          r.factory_id is null and r.tenant_id is not null and exists (
            select 1 from public.tenant_members tm
            where tm.tenant_id = r.tenant_id and tm.user_id = auth.uid()
          )
        )
      )
    )
  );

create policy "ai_predictions_insert_member" on public.ai_predictions
  for insert to authenticated
  with check (
    exists (
      select 1 from public.ai_runs r
      where r.id = ai_predictions.run_id
      and (
        r.created_by = auth.uid()
        or (
          r.factory_id is not null and exists (
            select 1 from public.v_user_factory_access a
            where a.factory_id = r.factory_id and a.user_id = auth.uid()
          )
        )
        or (
          r.factory_id is null and r.tenant_id is not null and exists (
            select 1 from public.tenant_members tm
            where tm.tenant_id = r.tenant_id and tm.user_id = auth.uid()
          )
        )
      )
    )
  );

-- AI Feedback policies
create policy "ai_feedback_select_member" on public.ai_feedback
  for select to authenticated
  using (
    exists (
      select 1 from public.ai_runs r
      where r.id = ai_feedback.run_id
      and (
        r.created_by = auth.uid()
        or (
          r.factory_id is not null and exists (
            select 1 from public.v_user_factory_access a
            where a.factory_id = r.factory_id and a.user_id = auth.uid()
          )
        )
        or (
          r.factory_id is null and r.tenant_id is not null and exists (
            select 1 from public.tenant_members tm
            where tm.tenant_id = r.tenant_id and tm.user_id = auth.uid()
          )
        )
      )
    )
  );

create policy "ai_feedback_insert_member" on public.ai_feedback
  for insert to authenticated
  with check (
    ai_feedback.user_id = auth.uid()
    and exists (
      select 1 from public.ai_runs r
      where r.id = ai_feedback.run_id
      and (
        r.created_by = auth.uid()
        or (
          r.factory_id is not null and exists (
            select 1 from public.v_user_factory_access a
            where a.factory_id = r.factory_id and a.user_id = auth.uid()
          )
        )
        or (
          r.factory_id is null and r.tenant_id is not null and exists (
            select 1 from public.tenant_members tm
            where tm.tenant_id = r.tenant_id and tm.user_id = auth.uid()
          )
        )
      )
    )
  );
