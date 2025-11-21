
-- TECHNICIANS (Digital Signature)
create table public.technicians (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  contact text,
  role text,
  entry_date date,
  signature_pin_hash text not null, -- Hashed PIN for signing
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
