const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID") || "";
  const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN") || "";
  const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER") || "";

  const result = {
    TWILIO_ACCOUNT_SID: {
      exists: twilioAccountSid.length > 0,
      length: twilioAccountSid.length,
      prefix: twilioAccountSid.substring(0, 3),
      valid: twilioAccountSid.startsWith('AC')
    },
    TWILIO_AUTH_TOKEN: {
      exists: twilioAuthToken.length > 0,
      length: twilioAuthToken.length,
      valid: twilioAuthToken.length > 20
    },
    TWILIO_PHONE_NUMBER: {
      exists: twilioPhoneNumber.length > 0,
      length: twilioPhoneNumber.length,
      prefix: twilioPhoneNumber.substring(0, 2),
      valid: twilioPhoneNumber.startsWith('+')
    },
    allConfigured: twilioAccountSid.startsWith('AC') && twilioAuthToken.length > 20 && twilioPhoneNumber.startsWith('+')
  };

  return new Response(
    JSON.stringify(result, null, 2),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});