import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const frenchCities = [
  "Paris", "Lyon", "Lille", "Marseille", "Toulouse", "Bordeaux",
  "Nantes", "Strasbourg", "Nice", "Montpellier", "Rennes",
  "Grenoble", "Angers", "Dijon", "Saint-Étienne", "Le Havre",
  "Toulon", "Clermont-Ferrand", "Limoges", "Villeurbanne"
];

const belgianCities = [
  "Bruxelles", "Anvers", "Gand", "Liège", "Namur",
  "Charleroi", "Bruges", "Mons", "Tournai", "Louvain"
];

const allCities = [...frenchCities, ...belgianCities];

const jobRoles = [
  "serveur", "serveuse", "barman", "barmaid", "cuisinier", "cuisinière",
  "chef", "commis", "plongeur", "hôte", "hôtesse", "réceptionniste",
  "livreur", "livreuse", "caissier", "caissière", "vendeur", "vendeuse",
  "agent", "employé", "aide", "assistant", "assistante", "manager",
  "responsable", "gérant", "boulanger", "pâtissier", "boucher"
];

const daysOfWeek = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function normalizeText(text: string): string {
  return text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function extractCity(text: string): string {
  const normalized = normalizeText(text);

  for (const city of allCities) {
    const normalizedCity = normalizeText(city);
    if (normalized.includes(normalizedCity)) {
      return city;
    }
  }

  const words = text.split(/[\s,;.]+/);
  for (const word of words) {
    const normalizedWord = normalizeText(word);
    for (const city of allCities) {
      const normalizedCity = normalizeText(city);
      if (normalizedWord === normalizedCity) {
        return city;
      }
    }
  }

  return "";
}

function extractRole(text: string): string {
  const normalized = normalizeText(text);

  for (const role of jobRoles) {
    if (normalized.includes(role)) {
      return role;
    }
  }

  return "";
}

function extractDate(text: string): string {
  const normalized = normalizeText(text);

  for (const day of daysOfWeek) {
    if (normalized.includes(day)) {
      const regex = new RegExp(`${day}\\s*(\\d{1,2})\\s*(${months.join("|")})?`, "i");
      const match = text.match(regex);
      if (match) {
        return match[0];
      }
      return day.charAt(0).toUpperCase() + day.slice(1);
    }
  }

  const datePattern = /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})?/;
  const match = text.match(datePattern);
  if (match) {
    return match[0];
  }

  return "";
}

function extractDuration(text: string): string {
  const timePattern = /(\d{1,2})h?(?:\s*[-–—]\s*|\s+à\s+)(\d{1,2})h?/gi;
  const match = text.match(timePattern);

  if (match) {
    return match[0].replace(/\s+/g, '').replace(/-/g, '–');
  }

  const singleTime = /(\d{1,2})h(\d{2})?/gi;
  const times = text.match(singleTime);
  if (times && times.length >= 2) {
    return `${times[0]}–${times[1]}`;
  }

  return "";
}

function extractHourly(text: string): string {
  const hourlyPattern = /(\d+(?:[.,]\d+)?)\s*(?:€|euros?)(?:\s*\/?\s*h(?:eure)?)?/gi;
  const match = text.match(hourlyPattern);

  if (match) {
    const value = match[0].replace(/,/g, '.').match(/\d+(?:\.\d+)?/)?.[0];
    return value ? `${value}€/h` : "";
  }

  return "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "prompt required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = {
      role: extractRole(prompt),
      city: extractCity(prompt),
      date: extractDate(prompt),
      duration: extractDuration(prompt),
      hourly: extractHourly(prompt),
    };

    console.log("Extracted data:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("uwi-extract error:", error);
    return new Response(
      JSON.stringify({
        error: String(error.message || error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});