// Script pour générer un sitemap dynamique
// À exécuter via une fonction serverless ou un cron job

const SITE_URL = 'https://lastminutejob.pro';

async function generateSitemap() {
  // URLs statiques
  const staticUrls = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/candidates', changefreq: 'daily', priority: '0.9' },
    { loc: '/privacy.html', changefreq: 'monthly', priority: '0.3' },
    { loc: '/terms.html', changefreq: 'monthly', priority: '0.3' }
  ];

  // URLs dynamiques (annonces) - à récupérer depuis Supabase
  // Pour l'instant, on retourne juste les URLs statiques
  // Dans un vrai environnement, on ferait un fetch vers Supabase
  
  const urls = staticUrls.map(url => ({
    loc: `${SITE_URL}${url.loc}`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: url.changefreq,
    priority: url.priority
  }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
}

// Pour utilisation dans un environnement Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateSitemap };
}

