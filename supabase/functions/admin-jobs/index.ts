import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function token(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

function isValidEmail(email: string): boolean {
  const e = String(email || '').trim();
  if (!e.includes('@')) return false;
  const [local, domain] = e.split('@');
  return !!local && !!domain && domain.includes('.') && domain.split('.').pop()!.length >= 2;
}

function isValidPhone(phone: string): boolean {
  return /^\+?\d[\d\s]{5,14}$/.test(String(phone || ''));
}

async function requireAdminSession(req: Request, supabase: any) {
  const authHeader = req.headers.get('authorization') || '';
  const sessionToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!sessionToken) {
    throw new Error('unauthorized');
  }

  const { data: session } = await supabase
    .from('admin_sessions')
    .select('admin_id')
    .eq('token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (!session) {
    throw new Error('invalid_session');
  }

  return session;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    await requireAdminSession(req, supabase);

    const idMatch = path.match(/\/admin-jobs\/([a-f0-9-]+)/);
    const jobId = idMatch ? idMatch[1] : null;

    if (method === 'GET' && !jobId) {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ jobs }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (method === 'POST' && !jobId) {
      const { title, body, parsed, contact, status = 'approved', source = 'import' } = await req.json();

      const email = contact?.email || '';
      const phone = contact?.phone || '';

      if (!isValidEmail(email) && !isValidPhone(phone)) {
        return new Response(
          JSON.stringify({ error: "email_or_phone_required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const job = {
        edit_token: token(),
        title: String(title || 'Annonce'),
        body: String(body || ''),
        parsed: parsed && typeof parsed === 'object' ? parsed : { role: '', city: '', date: '', duration: '', hourly: '' },
        contact: {
          company: contact?.company || '',
          name: contact?.name || '',
          email: String(email),
          phone: String(phone),
        },
        status: ['approved', 'pending', 'rejected'].includes(status) ? status : 'approved',
        source,
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert(job)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ ok: true, job: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (method === 'PUT' && jobId) {
      const { title, body, parsed, contact, status } = await req.json();

      const { data: existingJob } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .maybeSingle();

      if (!existingJob) {
        return new Response(
          JSON.stringify({ error: "not_found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const updates: any = {};

      if (typeof title === 'string') updates.title = title;
      if (typeof body === 'string') updates.body = body;
      if (parsed && typeof parsed === 'object') {
        updates.parsed = { ...existingJob.parsed, ...parsed };
      }
      if (contact && typeof contact === 'object') {
        const nextContact = { ...existingJob.contact, ...contact };
        if (!isValidEmail(nextContact.email) && !isValidPhone(nextContact.phone)) {
          return new Response(
            JSON.stringify({ error: "email_or_phone_required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        updates.contact = nextContact;
      }
      if (typeof status === 'string' && ['approved', 'pending', 'rejected'].includes(status)) {
        updates.status = status;
      }

      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ ok: true, job: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (method === 'DELETE' && jobId) {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ ok: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (method === 'POST' && jobId && path.endsWith('/status')) {
      const { status } = await req.json();

      if (!['approved', 'pending', 'rejected'].includes(status)) {
        return new Response(
          JSON.stringify({ error: "bad_status" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabase
        .from('jobs')
        .update({ status })
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ ok: true, job: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "not_found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const isAuth = error.message === 'unauthorized' || error.message === 'invalid_session';
    return new Response(
      JSON.stringify({ error: String(error.message || error) }),
      {
        status: isAuth ? 401 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});