-- Integration tokens and webhook/event log tables
-- Date: 2025-11-25

create table if not exists public.webhook_endpoints (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id),
  factory_id uuid references public.factories(id),
  name text not null,
  url text not null,
  secret text,
  status text check (status in ('active', 'paused')) default 'active',
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.webhook_events (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id),
  factory_id uuid references public.factories(id),
  endpoint_id uuid references public.webhook_endpoints(id) on delete set null,
  event_type text not null,
  payload jsonb not null,
  status text check (status in ('pending', 'delivered', 'failed')) default 'pending',
  retries integer default 0,
  last_error text,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_webhook_events_status on public.webhook_events(status, created_at);
create index if not exists idx_webhook_events_factory on public.webhook_events(factory_id, created_at);

create table if not exists public.integration_tokens (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id),
  factory_id uuid references public.factories(id),
  provider text not null,
  name text,
  config jsonb default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_used_at timestamp with time zone
);

create index if not exists idx_integration_tokens_provider on public.integration_tokens(provider);
create index if not exists idx_integration_tokens_factory on public.integration_tokens(factory_id);

-- RLS enablement
alter table public.webhook_endpoints enable row level security;
alter table public.webhook_events enable row level security;
alter table public.integration_tokens enable row level security;

-- Policies: tenant admins and factory members
create policy "webhook_endpoints_select_member" on public.webhook_endpoints
  for select to authenticated
  using (
    exists (
      select 1 from public.v_user_factory_access a
      where a.factory_id = webhook_endpoints.factory_id and a.user_id = auth.uid()
    )
    or webhook_endpoints.created_by = auth.uid()
  );

create policy "webhook_endpoints_insert_admin" on public.webhook_endpoints
  for insert to authenticated
  with check (
    exists (
      select 1 from public.v_tenant_admins a
      where a.tenant_id = webhook_endpoints.tenant_id and a.id = auth.uid()
    )
    or webhook_endpoints.created_by = auth.uid()
  );

create policy "webhook_events_select_member" on public.webhook_events
  for select to authenticated
  using (
    exists (
      select 1 from public.v_user_factory_access a
      where a.factory_id = webhook_events.factory_id and a.user_id = auth.uid()
    )
    or webhook_events.factory_id is null -- tenant-wide logs
  );

create policy "webhook_events_insert_admin" on public.webhook_events
  for insert to authenticated
  with check (
    exists (
      select 1 from public.v_user_factory_access a
      where a.factory_id = webhook_events.factory_id and a.user_id = auth.uid()
    )
    or exists (
      select 1 from public.v_tenant_admins a
      where a.tenant_id = webhook_events.tenant_id and a.id = auth.uid()
    )
  );

create policy "integration_tokens_select_admin" on public.integration_tokens
  for select to authenticated
  using (
    exists (
      select 1 from public.v_tenant_admins a
      where a.tenant_id = integration_tokens.tenant_id and a.id = auth.uid()
    )
  );

create policy "integration_tokens_insert_admin" on public.integration_tokens
  for insert to authenticated
  with check (
    exists (
      select 1 from public.v_tenant_admins a
      where a.tenant_id = integration_tokens.tenant_id and a.id = auth.uid()
    )
  );
