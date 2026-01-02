import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    await requireAdminSession(req, supabase);

    if (path.endsWith('/csv')) {
      const body = await req.text();
      const csv = body || '';
      
      if (!csv) {
        return new Response(
          JSON.stringify({ error: "csv_required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const lines = csv.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) {
        return new Response(
          JSON.stringify({ ok: true, imported: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const headers = lines[0].split(',').map(s => s.trim());
      const idx = (name: string) => headers.findIndex(h => h.toLowerCase() === name);

      const di = {
        title: idx('title'),
        body: idx('body'),
        role: idx('role'),
        city: idx('city'),
        date: idx('date'),
        duration: idx('duration'),
        hourly: idx('hourly'),
        company: idx('company'),
        name: idx('name'),
        email: idx('email'),
        phone: idx('phone'),
        status: idx('status'),
        source: idx('source'),
      };

      let count = 0;
      const ids: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (!cols.length) continue;

        const email = (di.email >= 0 ? cols[di.email] : '').trim();
        const phone = (di.phone >= 0 ? cols[di.phone] : '').trim();

        if (!isValidEmail(email) && !isValidPhone(phone)) continue;

        const job = {
          edit_token: token(),
          title: (di.title >= 0 ? cols[di.title] : 'Annonce').trim(),
          body: (di.body >= 0 ? cols[di.body] : '').trim(),
          parsed: {
            role: (di.role >= 0 ? cols[di.role] : '').trim(),
            city: (di.city >= 0 ? cols[di.city] : '').trim(),
            date: (di.date >= 0 ? cols[di.date] : '').trim(),
            duration: (di.duration >= 0 ? cols[di.duration] : '').trim(),
            hourly: (di.hourly >= 0 ? cols[di.hourly] : '').trim(),
          },
          contact: {
            company: (di.company >= 0 ? cols[di.company] : '').trim(),
            name: (di.name >= 0 ? cols[di.name] : '').trim(),
            email,
            phone,
          },
          status:
            di.status >= 0 && ['approved', 'pending', 'rejected'].includes(cols[di.status])
              ? cols[di.status]
              : 'approved',
          source: di.source >= 0 ? cols[di.source] : 'import',
        };

        const { data, error } = await supabase
          .from('jobs')
          .insert(job)
          .select('id')
          .single();

        if (!error && data) {
          ids.push(data.id);
          count++;
        }
      }

      return new Response(
        JSON.stringify({ ok: true, imported: count, ids }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (path.endsWith('/scrape')) {
      const { url: targetUrl, status = 'approved', source = 'import' } = await req.json();

      if (!targetUrl) {
        return new Response(
          JSON.stringify({ error: "url_required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const response = await fetch(targetUrl).catch(() => null);
      if (!response || !response.ok) {
        return new Response(
          JSON.stringify({ error: "fetch_failed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const html = await response.text();
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const title = (titleMatch?.[1] || '').trim();

      const bodyTxt = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 1200);

      const job = {
        edit_token: token(),
        title: title || 'Annonce importée',
        body: bodyTxt,
        parsed: { role: '', city: '', date: '', duration: '', hourly: '' },
        contact: { company: '', name: '', email: '', phone: '' },
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
