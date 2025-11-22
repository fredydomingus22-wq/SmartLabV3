-- Create technicians table
create table if not exists public.technicians (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  role text not null,
  active boolean default true,
  signature_pin_hash text, -- In a real app, this should be hashed. For now, we store as is or assume hash.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert some dummy technicians for testing
insert into public.technicians (name, role, signature_pin_hash)
values 
  ('John Doe', 'Analyst', '1234'),
  ('Jane Smith', 'Supervisor', '5678')
on conflict do nothing;
