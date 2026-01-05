/*
  # Create applications table
  
  This table stores job applications linking jobs to candidates.
  
  1. Structure
    - Links jobs to candidates via foreign keys
    - Stores application status and message
    - Tracks candidate information (name, email, phone)
  
  2. Relations
    - job_id → public.jobs(id)
    - candidate_id → public.candidates(id)
  
  3. Indexes
    - Index on job_id for fast lookups
    - Index on candidate_id for candidate history
    - Index on status for filtering
  
  4. Security
    - Enable RLS
    - Public can read applications for published jobs
    - Authenticated users can create applications
    - Admins can manage all applications
*/

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  candidate_id uuid references public.candidates (id) on delete set null,
  
  -- Candidate information (stored directly for quick access)
  candidate_name text,
  candidate_email text,
  candidate_phone text,
  
  -- Application details
  status text not null default 'new' check (status in ('new', 'seen', 'shortlisted', 'rejected', 'hired')),
  message text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes
create index applications_job_id_idx on public.applications (job_id);
create index applications_candidate_id_idx on public.applications (candidate_id) where candidate_id is not null;
create index applications_status_idx on public.applications (status);
create index applications_created_at_idx on public.applications (created_at desc);

-- Create function to automatically update updated_at timestamp
create or replace function update_applications_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_applications_updated_at
  before update on public.applications
  for each row
  execute function update_applications_updated_at();

-- Enable RLS
alter table public.applications enable row level security;

-- Policy: Public can read applications for published jobs
create policy "Public can read applications for published jobs"
  on public.applications
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.jobs
      where jobs.id = applications.job_id
      and jobs.status = 'published'
    )
  );

-- Policy: Authenticated users can read all applications (for admin dashboard)
create policy "Authenticated users can read all applications"
  on public.applications
  for select
  to authenticated
  using (true);

-- Policy: Anyone can create applications
create policy "Anyone can create applications"
  on public.applications
  for insert
  to anon, authenticated
  with check (true);

-- Policy: Authenticated users can update applications (for admin)
create policy "Authenticated users can update applications"
  on public.applications
  for update
  to authenticated
  using (true)
  with check (true);

-- Policy: Authenticated users can delete applications (for admin)
create policy "Authenticated users can delete applications"
  on public.applications
  for delete
  to authenticated
  using (true);

