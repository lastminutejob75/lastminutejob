/*
  # Create job_intents table
  
  This table stores structured intent data for jobs, allowing for better categorization
  and search capabilities.
  
  1. Structure
    - Links to jobs table via job_id
    - Three-level categorization: main_role, sector, service_type
    - Tags array for additional metadata
    - Confidence score for future AI integration
  
  2. Indexes
    - Index on main_role for role-based queries
    - Index on sector for sector-based filtering
*/

create table public.job_intents (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,

  -- Niveau 1 : métier principal
  main_role text not null,         -- ex: "Serveur"
  sector text,                     -- ex: "Restauration"
  
  -- Niveau 2 : type de prestation
  service_type text,               -- ex: "Extra", "Événementiel", "Mission courte"

  -- Niveau 3 : signaux faibles
  tags text[] default '{}',         -- ex: ["weekend", "urgent", "soir"]

  confidence numeric default 1.0,   -- score de confiance (utile si IA plus tard)

  created_at timestamptz default now()
);

create index job_intents_role_idx on public.job_intents (main_role);
create index job_intents_sector_idx on public.job_intents (sector);
create index job_intents_job_id_idx on public.job_intents (job_id);

-- Enable RLS
alter table public.job_intents enable row level security;

-- Public can read job intents (for published jobs)
create policy "Public can read job intents"
  on public.job_intents
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.jobs
      where jobs.id = job_intents.job_id
      and jobs.status = 'published'
    )
  );

-- Authenticated users can read all job intents
create policy "Authenticated users can read all job intents"
  on public.job_intents
  for select
  to authenticated
  using (true);

-- Authenticated users can insert job intents
create policy "Authenticated users can insert job intents"
  on public.job_intents
  for insert
  to authenticated
  with check (true);

-- Authenticated users can update job intents
create policy "Authenticated users can update job intents"
  on public.job_intents
  for update
  to authenticated
  using (true);

-- Authenticated users can delete job intents
create policy "Authenticated users can delete job intents"
  on public.job_intents
  for delete
  to authenticated
  using (true);

