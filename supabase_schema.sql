-- Create table for storing access logs
create table public.access_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  image_url text not null,
  detection_id text,
  matched_card_id text,
  confidence float,
  status text check (status in ('MATCH', 'NO_MATCH', 'ERROR')),
  metadata jsonb
);

-- Enable RLS
alter table public.access_logs enable row level security;

-- Create policy to allow backend (service role) to insert/read
create policy "Enable all access for service role" on public.access_logs
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Create policy to allow public read (optional, if you want frontend to read logs directly)
-- create policy "Enable read for anon" on public.access_logs for select using (true);
