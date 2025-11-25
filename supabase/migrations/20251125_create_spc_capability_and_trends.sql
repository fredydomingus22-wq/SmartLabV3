-- SPC Capability and Trend scaffolding
-- Adds capability metrics and trend windows to support Cpk/Ppk and trend analysis dashboards
-- Date: 2025-11-25

create table if not exists public.spc_capability_metrics (
  id uuid default uuid_generate_v4() primary key,
  chart_id uuid references public.spc_charts(id),
  parameter_id uuid references public.parameters(id),
  production_lot_id uuid references public.production_lots(id),
  window_start timestamp with time zone,
  window_end timestamp with time zone,
  subgroup_size integer,
  samples_count integer,
  mean_value numeric,
  std_dev numeric,
  cp numeric,
  cpk numeric,
  pp numeric,
  ppk numeric,
  lower_spec_limit numeric,
  upper_spec_limit numeric,
  oos_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_spc_capability_chart on public.spc_capability_metrics(chart_id, window_end);
create index if not exists idx_spc_capability_param on public.spc_capability_metrics(parameter_id, window_end);

create table if not exists public.spc_trend_windows (
  id uuid default uuid_generate_v4() primary key,
  chart_id uuid references public.spc_charts(id),
  parameter_id uuid references public.parameters(id),
  window_start timestamp with time zone,
  window_end timestamp with time zone,
  slope numeric,
  direction text check (direction in ('improving', 'stable', 'degrading')) default 'stable',
  anomaly_score numeric,
  heatmap_bucket text,
  predicted_risk numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_spc_trend_chart on public.spc_trend_windows(chart_id, window_end);
create index if not exists idx_spc_trend_param on public.spc_trend_windows(parameter_id, window_end);

-- RLS enablement
alter table public.spc_capability_metrics enable row level security;
alter table public.spc_trend_windows enable row level security;

-- Reuse existing privileged view for SPC (admin/manager/supervisor)
-- Read: all authenticated users can read aggregated SPC outputs
create policy "spc_capability_read_auth" on public.spc_capability_metrics
  for select to authenticated using (true);

create policy "spc_trend_read_auth" on public.spc_trend_windows
  for select to authenticated using (true);

-- Write: only privileged SPC users (admin/manager/supervisor)
create policy "spc_capability_write_privileged" on public.spc_capability_metrics
  for insert to authenticated
  with check (exists (select 1 from public.v_spc_privileged_users p where p.id = auth.uid()));

create policy "spc_trend_write_privileged" on public.spc_trend_windows
  for insert to authenticated
  with check (exists (select 1 from public.v_spc_privileged_users p where p.id = auth.uid()));
