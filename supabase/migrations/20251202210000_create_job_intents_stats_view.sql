/*
  # Create views for job_intents statistics
  
  This file provides aggregated statistics about job intents by main_role and sector,
  making it easy to query the most common roles and sectors.
*/

-- Vue pour les statistiques par rôle principal
create or replace view public.job_intents_stats as
select 
  main_role,
  count(*) as total,
  count(distinct job_id) as unique_jobs
from public.job_intents
group by main_role
order by total desc;

-- Vue pour les statistiques par secteur
create or replace view public.job_intents_sector_stats as
select 
  sector,
  count(*) as total,
  count(distinct job_id) as unique_jobs
from public.job_intents
where sector is not null
group by sector
order by total desc;

-- Grant permissions
grant select on public.job_intents_stats to anon, authenticated;
grant select on public.job_intents_sector_stats to anon, authenticated;

-- Vue pour les statistiques hebdomadaires par rôle
create or replace view public.job_intents_weekly_stats as
select
  date_trunc('week', created_at) as week,
  main_role,
  count(*) as total,
  count(distinct job_id) as unique_jobs
from public.job_intents
group by week, main_role
order by week desc;

-- Grant permissions
grant select on public.job_intents_weekly_stats to anon, authenticated;

-- Comments
comment on view public.job_intents_stats is 'Statistiques agrégées des job_intents par main_role';
comment on view public.job_intents_sector_stats is 'Statistiques agrégées des job_intents par sector';
comment on view public.job_intents_weekly_stats is 'Statistiques hebdomadaires des job_intents par main_role';

