-- Multi-tenant / Multi-factory foundation
-- Creates tenants, factories, and membership tables with RLS policies
-- Date: 2025-11-25

create table if not exists public.tenants (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  status text check (status in ('active', 'suspended')) default 'active',
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.factories (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade,
  name text not null,
  code text not null,
  timezone text default 'UTC',
  is_default boolean default false,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (tenant_id, code)
);

create table if not exists public.tenant_members (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade,
  user_id uuid references public.profiles(id),
  role text check (role in ('tenant_admin', 'tenant_viewer')) not null default 'tenant_admin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (tenant_id, user_id)
);

create table if not exists public.factory_members (
  id uuid default uuid_generate_v4() primary key,
  factory_id uuid references public.factories(id) on delete cascade,
  user_id uuid references public.profiles(id),
  role text check (role in ('factory_manager', 'supervisor', 'technician', 'viewer')) not null default 'factory_manager',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (factory_id, user_id)
);

create index if not exists idx_factories_tenant on public.factories(tenant_id);
create index if not exists idx_factory_members_user on public.factory_members(user_id);
create index if not exists idx_tenant_members_user on public.tenant_members(user_id);

-- Row Level Security
alter table public.tenants enable row level security;
alter table public.factories enable row level security;
alter table public.tenant_members enable row level security;
alter table public.factory_members enable row level security;

-- Helper: check if current user is tenant admin
create or replace view public.v_tenant_admins as
select tm.user_id as id, tm.tenant_id
from public.tenant_members tm
where tm.role = 'tenant_admin';

-- Tenants policies
create policy "tenants_select_member_or_creator" on public.tenants
  for select to authenticated
  using (
    exists (select 1 from public.tenant_members tm where tm.tenant_id = tenants.id and tm.user_id = auth.uid())
    or tenants.created_by = auth.uid()
  );

create policy "tenants_insert_creator" on public.tenants
  for insert to authenticated
  with check (auth.uid() is not null);

create policy "tenants_update_admin" on public.tenants
  for update to authenticated
  using (exists (select 1 from public.v_tenant_admins a where a.tenant_id = tenants.id and a.id = auth.uid()))
  with check (exists (select 1 from public.v_tenant_admins a where a.tenant_id = tenants.id and a.id = auth.uid()));

-- Factories policies
create policy "factories_select_member_or_creator" on public.factories
  for select to authenticated
  using (
    exists (
      select 1 from public.factory_members fm
      where fm.factory_id = factories.id and fm.user_id = auth.uid()
    )
    or exists (
      select 1 from public.tenant_members tm
      where tm.tenant_id = factories.tenant_id and tm.user_id = auth.uid()
    )
    or factories.created_by = auth.uid()
  );

create policy "factories_insert_tenant_admin" on public.factories
  for insert to authenticated
  with check (
    exists (
      select 1 from public.v_tenant_admins a
      where a.tenant_id = factories.tenant_id and a.id = auth.uid()
    )
    or factories.created_by = auth.uid()
  );

create policy "factories_update_admin" on public.factories
  for update to authenticated
  using (
    exists (
      select 1 from public.v_tenant_admins a
      where a.tenant_id = factories.tenant_id and a.id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.v_tenant_admins a
      where a.tenant_id = factories.tenant_id and a.id = auth.uid()
    )
  );

-- Tenant members policies
create policy "tenant_members_select_self" on public.tenant_members
  for select to authenticated
  using (tenant_members.user_id = auth.uid()
    or exists (select 1 from public.v_tenant_admins a where a.tenant_id = tenant_members.tenant_id and a.id = auth.uid()));

create policy "tenant_members_insert_self_or_admin" on public.tenant_members
  for insert to authenticated
  with check (
    tenant_members.user_id = auth.uid()
    or exists (select 1 from public.v_tenant_admins a where a.tenant_id = tenant_members.tenant_id and a.id = auth.uid())
  );

create policy "tenant_members_update_admin" on public.tenant_members
  for update to authenticated
  using (exists (select 1 from public.v_tenant_admins a where a.tenant_id = tenant_members.tenant_id and a.id = auth.uid()))
  with check (exists (select 1 from public.v_tenant_admins a where a.tenant_id = tenant_members.tenant_id and a.id = auth.uid()));

-- Factory members policies
create policy "factory_members_select_self" on public.factory_members
  for select to authenticated
  using (
    factory_members.user_id = auth.uid()
    or exists (
      select 1 from public.v_tenant_admins a
      join public.factories f on f.tenant_id = a.tenant_id
      where f.id = factory_members.factory_id and a.id = auth.uid()
    )
  );

create policy "factory_members_insert_admin_or_self" on public.factory_members
  for insert to authenticated
  with check (
    factory_members.user_id = auth.uid()
    or exists (
      select 1 from public.v_tenant_admins a
      join public.factories f on f.tenant_id = a.tenant_id
      where f.id = factory_members.factory_id and a.id = auth.uid()
    )
  );

create policy "factory_members_update_admin" on public.factory_members
  for update to authenticated
  using (
    exists (
      select 1 from public.v_tenant_admins a
      join public.factories f on f.tenant_id = a.tenant_id
      where f.id = factory_members.factory_id and a.id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.v_tenant_admins a
      join public.factories f on f.tenant_id = a.tenant_id
      where f.id = factory_members.factory_id and a.id = auth.uid()
    )
  );
