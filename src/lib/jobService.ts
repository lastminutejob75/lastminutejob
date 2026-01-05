import { supabase } from './supabase';

export async function publishJob(jobData: any) {
  const jobRecord = {
    title: jobData.title || 'Annonce',
    body: jobData.body || '',
    edit_token: jobData.edit_token,
    parsed: {
      role: jobData.role || '',
      city: jobData.city || '',
      date: jobData.date || '',
      duration: jobData.duration || '',
      hourly: jobData.hourly_rate || ''
    },
    contact: {
      company: jobData.company_name || '',
      name: jobData.contact_name || '',
      email: jobData.contact_email || '',
      phone: jobData.contact_phone || ''
    },
    status: 'approved'
  };

  const { data, error } = await supabase
    .from('jobs')
    .insert([jobRecord])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error publishing job:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
    console.error('Hint:', error.hint);
    console.error('Job data attempted:', JSON.stringify(jobRecord, null, 2));

    const errorMessage = error.message || error.code || 'Erreur inconnue';
    const fullError = `Erreur Supabase: ${errorMessage}${error.code ? ` (Code: ${error.code})` : ''}${error.details ? `\nDétails: ${error.details}` : ''}${error.hint ? `\nIndice: ${error.hint}` : ''}`;
    throw new Error(fullError);
  }

  if (!data) {
    console.error('No data returned from insert');
    throw new Error('Aucune donnée retournée après l\'insertion');
  }

  return data;
}

export async function publishJobWithVerification(jobData: any) {
  return publishJob(jobData);
}

export async function getJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('id, title, created_at, parsed, contact')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  return (data || []).map((job: any) => ({
    id: job.id,
    title: job.title,
    created_at: job.created_at,
    role: job.parsed?.role || '',
    city: job.parsed?.city || '',
    date: job.parsed?.date || '',
    duration: job.parsed?.duration || '',
    hourly: job.parsed?.hourly || '',
    company_name: job.contact?.company || '',
    contact_email: job.contact?.email || '',
    contact_phone: job.contact?.phone || ''
  }));
}

export async function getJob(id: string) {
  const { data: jobData, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .maybeSingle();

  if (jobError) {
    console.error('Error fetching job:', jobError);
    return null;
  }

  if (!jobData) return null;

  const { data: questionsData, error: questionsError } = await supabase
    .from('prescreen_questions')
    .select('id, question_text, question_order')
    .eq('job_id', id)
    .order('question_order', { ascending: true });

  if (questionsError) {
    console.error('Error fetching prescreen questions:', questionsError);
  }

  return {
    id: jobData.id,
    title: jobData.title,
    body: jobData.body,
    edit_token: jobData.edit_token,
    created_at: jobData.created_at,
    role: jobData.parsed?.role || '',
    city: jobData.parsed?.city || '',
    date: jobData.parsed?.date || '',
    duration: jobData.parsed?.duration || '',
    company_name: jobData.contact?.company || '',
    contact_name: jobData.contact?.name || '',
    contact_email: jobData.contact?.email || '',
    contact_phone: jobData.contact?.phone || '',
    prescreen_questions: questionsData || []
  };
}

export async function updateJob(id: string, editToken: string, updates: any) {
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .eq('edit_token', editToken)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating job:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    body: data.body,
    edit_token: data.edit_token,
    created_at: data.created_at,
    role: data.parsed?.role || '',
    city: data.parsed?.city || '',
    date: data.parsed?.date || '',
    duration: data.parsed?.duration || '',
    company_name: data.contact?.company || '',
    contact_name: data.contact?.name || '',
    contact_email: data.contact?.email || '',
    contact_phone: data.contact?.phone || ''
  };
}

export async function deleteJob(id: string, editToken: string) {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)
    .eq('edit_token', editToken);

  if (error) {
    console.error('Error deleting job:', error);
    return false;
  }

  return true;
}
