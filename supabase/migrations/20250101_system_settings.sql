-- SYSTEM SETTINGS
create table public.system_settings (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  value jsonb not null,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references public.profiles(id)
);

-- Initial Settings
insert into public.system_settings (key, value, description) values
('company_info', '{"name": "SmartLab Enterprise", "address": "Luanda, Angola"}'::jsonb, 'Basic company information'),
('theme', '{"mode": "light", "primaryColor": "#007bff"}'::jsonb, 'UI Theme settings'),
('modules', '{"production": true, "lab": true, "quality": true}'::jsonb, 'Enabled modules');
