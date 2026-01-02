import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function token(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

function hashPassword(password: string, salt: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}:${salt}`);
  return crypto.subtle.digest('SHA-256', data).then((hash) => {
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  });
}

function isValidEmail(email: string): boolean {
  const e = String(email || '').trim();
  if (!e.includes('@')) return false;
  const [local, domain] = e.split('@');
  return !!local && !!domain && domain.includes('.') && domain.split('.').pop()!.length >= 2;
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
    if (path.endsWith('/register')) {
      const { email, password } = await req.json();
      
      if (!isValidEmail(email)) {
        return new Response(
          JSON.stringify({ error: "bad_email" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!password || String(password).length < 6) {
        return new Response(
          JSON.stringify({ error: "weak_password" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: existing } = await supabase
        .from('admin_users')
        .select('id')
        .ilike('email', email)
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ error: "email_exists" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { count } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true });

      if (count && count > 0) {
        const authHeader = req.headers.get('authorization') || '';
        const sessionToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
        
        if (!sessionToken) {
          return new Response(
            JSON.stringify({ error: "admin_required" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: session } = await supabase
          .from('admin_sessions')
          .select('*')
          .eq('token', sessionToken)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        if (!session) {
          return new Response(
            JSON.stringify({ error: "admin_required" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const salt = token();
      const passHash = await hashPassword(password, salt);

      const { data: admin, error } = await supabase
        .from('admin_users')
        .insert({ email: String(email), pass_hash: passHash, salt })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ ok: true, admin: { id: admin.id, email: admin.email, createdAt: admin.created_at } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (path.endsWith('/login')) {
      const { email, password } = await req.json();

      if (!isValidEmail(email)) {
        return new Response(
          JSON.stringify({ error: "bad_email" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: admin } = await supabase
        .from('admin_users')
        .select('*')
        .ilike('email', email)
        .maybeSingle();

      if (!admin) {
        return new Response(
          JSON.stringify({ error: "invalid_credentials" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const passHash = await hashPassword(password || '', admin.salt);

      if (passHash !== admin.pass_hash) {
        return new Response(
          JSON.stringify({ error: "invalid_credentials" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const sessionToken = token();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      await supabase
        .from('admin_sessions')
        .insert({
          token: sessionToken,
          admin_id: admin.id,
          expires_at: expiresAt,
        });

      return new Response(
        JSON.stringify({
          ok: true,
          token: sessionToken,
          admin: { id: admin.id, email: admin.email },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (path.endsWith('/logout')) {
      const authHeader = req.headers.get('authorization') || '';
      const sessionToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

      if (sessionToken) {
        await supabase
          .from('admin_sessions')
          .delete()
          .eq('token', sessionToken);
      }

      return new Response(
        JSON.stringify({ ok: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (path.endsWith('/me')) {
      const authHeader = req.headers.get('authorization') || '';
      const sessionToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

      if (!sessionToken) {
        return new Response(
          JSON.stringify({ error: "unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: session } = await supabase
        .from('admin_sessions')
        .select('admin_id')
        .eq('token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (!session) {
        return new Response(
          JSON.stringify({ error: "invalid_session" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: admin } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('id', session.admin_id)
        .single();

      return new Response(
        JSON.stringify({ ok: true, admin }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "not_found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error.message || error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});