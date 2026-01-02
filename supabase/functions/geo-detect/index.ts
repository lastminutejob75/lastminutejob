import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CITIES_FR_BE = [
  'Paris','Marseille','Lyon','Toulouse','Nice','Nantes','Strasbourg','Montpellier','Bordeaux','Lille','Rennes','Reims','Grenoble','Dijon','Angers','Nîmes','Villeurbanne','Saint-Étienne','Toulon','Le Havre','Clermont-Ferrand','Aix-en-Provence','Rouen','Nancy','Metz','Mulhouse','Caen','Tours','Orléans','Amiens','Limoges','Besançon','Perpignan','Brest','Poitiers','Pau','Bayonne','Annecy','La Rochelle','Valenciennes','Dunkerque','Calais','Boulogne-sur-Mer','Béthune','Arras','Lens','Tourcoing','Roubaix','Villeneuve-d\'Ascq','Saint-Denis','Argenteuil','Montreuil','Versailles','Vitry-sur-Seine','Nanterre','Créteil','Courbevoie','Colombes','Aulnay-sous-Bois','Rueil-Malmaison','Saint-Maur-des-Fossés','Champigny-sur-Marne','Antony','Levallois-Perret','Neuilly-sur-Seine','Issy-les-Moulineaux','Boulogne-Billancourt','Clamart','Meudon','Suresnes','Clichy','Ivry-sur-Seine','Aubervilliers','Saint-Ouen','Asnières-sur-Seine','Sarcelles','Sevran','Drancy','Noisy-le-Grand','Saint-Quentin','Charleville-Mézières','Chalon-sur-Saône','Mâcon','Bourg-en-Bresse','Chambéry','Valence','Avignon','Albi','Montauban','Tarbes','Narbonne','Béziers','Carcassonne','Périgueux','Brive-la-Gaillarde','Aurillac','Vichy','Saint-Malo','Quimper','Vannes','Lorient','Cholet','Niort','Angoulême','Cognac','Troyes','Épinal','Thionville','Forbach','Colmar','Saint-Nazaire','Choisy-le-Roi',
  'Bruxelles','Brussels','Anvers','Antwerpen','Gand','Gent','Liège','Namur','Charleroi','Louvain','Leuven','Bruges','Brugge','Mons','Tournai','Arlon','La Louvière','Hasselt','Courtrai','Kortrijk','Wavre','Ottignies','Nivelles','Verviers','Seraing','Mouscron','Ostende','Oostende','Roulers','Roeselare','Malines','Mechelen','Genk','Aalst','Alost','Saint-Nicolas','Sint-Niklaas','Laeken','Schaerbeek','Schaarbeek','Anderlecht','Molenbeek','Ixelles','Elsene','Etterbeek','Uccle','Ukkel','Woluwe-Saint-Lambert','Sint-Lambrechts-Woluwe','Woluwe-Saint-Pierre','Sint-Pieters-Woluwe'
];

// Mapping étendu des villes avec variations
const CITY_MAP: Record<string, string> = {
  // France
  'paris': 'Paris',
  'marseille': 'Marseille',
  'lyon': 'Lyon',
  'toulouse': 'Toulouse',
  'nice': 'Nice',
  'nantes': 'Nantes',
  'strasbourg': 'Strasbourg',
  'montpellier': 'Montpellier',
  'bordeaux': 'Bordeaux',
  'lille': 'Lille',
  'rennes': 'Rennes',
  'reims': 'Reims',
  'grenoble': 'Grenoble',
  'dijon': 'Dijon',
  'angers': 'Angers',
  'nîmes': 'Nîmes',
  'nimes': 'Nîmes',
  'villeurbanne': 'Villeurbanne',
  'saint-étienne': 'Saint-Étienne',
  'saint etienne': 'Saint-Étienne',
  'toulon': 'Toulon',
  'le havre': 'Le Havre',
  'havre': 'Le Havre',
  'clermont-ferrand': 'Clermont-Ferrand',
  'clermont ferrand': 'Clermont-Ferrand',
  'aix-en-provence': 'Aix-en-Provence',
  'aix en provence': 'Aix-en-Provence',
  'rouen': 'Rouen',
  'nancy': 'Nancy',
  'metz': 'Metz',
  'mulhouse': 'Mulhouse',
  'caen': 'Caen',
  'tours': 'Tours',
  'orléans': 'Orléans',
  'orleans': 'Orléans',
  'amiens': 'Amiens',
  'limoges': 'Limoges',
  'besançon': 'Besançon',
  'besancon': 'Besançon',
  'perpignan': 'Perpignan',
  'brest': 'Brest',
  'poitiers': 'Poitiers',
  'pau': 'Pau',
  'bayonne': 'Bayonne',
  'annecy': 'Annecy',
  'la rochelle': 'La Rochelle',
  'rochelle': 'La Rochelle',
  'valenciennes': 'Valenciennes',
  'dunkerque': 'Dunkerque',
  'calais': 'Calais',
  'boulogne-sur-mer': 'Boulogne-sur-Mer',
  'boulogne sur mer': 'Boulogne-sur-Mer',
  'béthune': 'Béthune',
  'bethune': 'Béthune',
  'arras': 'Arras',
  'lens': 'Lens',
  'tourcoing': 'Tourcoing',
  'roubaix': 'Roubaix',
  'versailles': 'Versailles',
  'nanterre': 'Nanterre',
  'créteil': 'Créteil',
  'creteil': 'Créteil',
  'courbevoie': 'Courbevoie',
  'colombes': 'Colombes',
  'argenteuil': 'Argenteuil',
  'montreuil': 'Montreuil',
  'saint-denis': 'Saint-Denis',
  'saint denis': 'Saint-Denis',
  'vitry-sur-seine': 'Vitry-sur-Seine',
  'vitry sur seine': 'Vitry-sur-Seine',
  // Belgique
  'brussels': 'Bruxelles',
  'bruxelles': 'Bruxelles',
  'antwerp': 'Anvers',
  'anvers': 'Anvers',
  'antwerpen': 'Anvers',
  'ghent': 'Gand',
  'gent': 'Gand',
  'gand': 'Gand',
  'liege': 'Liège',
  'liège': 'Liège',
  'namur': 'Namur',
  'charleroi': 'Charleroi',
  'louvain': 'Louvain',
  'leuven': 'Louvain',
  'bruges': 'Bruges',
  'brugge': 'Bruges',
  'mons': 'Mons',
  'tournai': 'Tournai',
  'arlon': 'Arlon',
  'la louvière': 'La Louvière',
  'louviere': 'La Louvière',
  'hasselt': 'Hasselt',
  'courtrai': 'Courtrai',
  'kortrijk': 'Courtrai',
  'wavre': 'Wavre',
  'ottignies': 'Ottignies',
  'nivelles': 'Nivelles',
  'verviers': 'Verviers',
  'seraing': 'Seraing',
  'mouscron': 'Mouscron',
  'ostende': 'Ostende',
  'oostende': 'Ostende',
  'ostend': 'Ostende',
  'roulers': 'Roulers',
  'roeselare': 'Roulers',
  'malines': 'Malines',
  'mechelen': 'Malines',
  'genk': 'Genk',
  'aalst': 'Aalst',
  'alost': 'Aalst',
  'saint-nicolas': 'Saint-Nicolas',
  'sint-niklaas': 'Saint-Nicolas',
  'sint niklaas': 'Saint-Nicolas',
};

// Mapping des régions vers les villes principales
const REGION_TO_CITY: Record<string, string> = {
  'île-de-france': 'Paris',
  'ile de france': 'Paris',
  'idf': 'Paris',
  'provence-alpes-côte d\'azur': 'Marseille',
  'paca': 'Marseille',
  'auvergne-rhône-alpes': 'Lyon',
  'rhône-alpes': 'Lyon',
  'occitanie': 'Toulouse',
  'nouvelle-aquitaine': 'Bordeaux',
  'hauts-de-france': 'Lille',
  'grand est': 'Strasbourg',
  'normandie': 'Rouen',
  'bretagne': 'Rennes',
  'pays de la loire': 'Nantes',
  'centre-val de loire': 'Tours',
  'bourgogne-franche-comté': 'Dijon',
  'corse': 'Nice',
  'wallonie': 'Liège',
  'flandre': 'Gand',
  'flanders': 'Gand',
  'vlaanderen': 'Gand',
  'brussels-capital': 'Bruxelles',
  'brussels capital': 'Bruxelles',
};

function guessCity(text: string): string {
  const t = String(text || '');
  for (const city of CITIES_FR_BE) {
    const escaped = city.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(t)) {
      return city;
    }
  }
  return '';
}

/**
 * Détection améliorée de la ville depuis l'IP avec plusieurs services en fallback
 */
async function detectCityFromIP(ip: string): Promise<string> {
  // Ignorer les IPs locales ou invalides
  if (!ip || ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return '';
  }

  // Essayer plusieurs services de géolocalisation en fallback
  const services = [
    // Service 1: ip-api.com (gratuit, 45 req/min)
    async () => {
      try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,region,countryCode`, {
          signal: AbortSignal.timeout(3000),
        });
        const data = await response.json();
        if (data.status === 'success') {
          return { city: data.city, region: data.region, countryCode: data.countryCode };
        }
      } catch (e) {
        // Ignorer les erreurs
      }
      return null;
    },
    // Service 2: ipapi.co (gratuit, 1000 req/jour)
    async () => {
      try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`, {
          signal: AbortSignal.timeout(3000),
        });
        const data = await response.json();
        if (data.city && !data.error) {
          return { city: data.city, region: data.region, countryCode: data.country_code };
        }
      } catch (e) {
        // Ignorer les erreurs
      }
      return null;
    },
  ];

  // Essayer chaque service jusqu'à obtenir un résultat
  for (const service of services) {
    try {
      const result = await service();
      if (result && (result.countryCode === 'FR' || result.countryCode === 'BE')) {
        const cityLower = (result.city || '').toLowerCase().trim();
        
        // Vérifier le mapping direct
        const mapped = CITY_MAP[cityLower];
        if (mapped) return mapped;

        // Vérifier dans la liste des villes
        const found = CITIES_FR_BE.find(c => c.toLowerCase() === cityLower);
        if (found) return found;

        // Vérifier les correspondances partielles (ex: "Paris 15" -> "Paris")
        const partialMatch = CITIES_FR_BE.find(c => {
          const cLower = c.toLowerCase();
          return cityLower.includes(cLower) || cLower.includes(cityLower);
        });
        if (partialMatch) return partialMatch;

        // Vérifier le mapping par région
        if (result.region) {
          const regionLower = result.region.toLowerCase();
          const regionCity = REGION_TO_CITY[regionLower];
          if (regionCity) return regionCity;
        }

        // Fallback par pays
        if (result.countryCode === 'FR') return 'Paris';
        if (result.countryCode === 'BE') return 'Bruxelles';
      }
    } catch (error) {
      // Continuer avec le service suivant
      continue;
    }
  }

  return '';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method === "GET") {
      const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || req.headers.get('x-real-ip')
        || 'unknown';

      const city = await detectCityFromIP(clientIP);

      return new Response(JSON.stringify({ city, ip: clientIP }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const { text } = await req.json();
      if (!text || typeof text !== "string") {
        return new Response(
          JSON.stringify({ error: "text required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const city = guessCity(text);

      return new Response(JSON.stringify({ city }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
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
