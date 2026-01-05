import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'job';
  jobPosting?: {
    title: string;
    description: string;
    company: string;
    location: string;
    datePosted?: string;
    employmentType?: string;
    baseSalary?: {
      currency: string;
      value: {
        minValue?: number;
        maxValue?: number;
        value?: number;
      };
    };
  };
}

export default function SEO({
  title = "LastMinuteJob - Offres d'emploi en France et Belgique",
  description = "Trouvez les meilleures offres d'emploi en France et Belgique. Publiez et consultez des annonces d'emploi gratuites dans l'hôtellerie, restauration, logistique, santé et plus.",
  keywords = "offres d'emploi, emploi France, emploi Belgique, jobs, recrutement, candidature en ligne, annonces emploi, travail temporaire",
  image = "https://lastminutejob.pro/screenshot.png",
  url = "https://lastminutejob.pro/",
  type = "website",
  jobPosting
}: SEOProps) {
  const fullTitle = title.includes('LastMinuteJob') ? title : `${title} | LastMinuteJob`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : url;

  // Schema.org JSON-LD
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Last Minute Job",
    "url": "https://lastminutejob.pro/",
    "description": "Plateforme d'offres d'emploi en France et Belgique",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://lastminutejob.pro/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const jobPostingSchema = jobPosting ? {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": jobPosting.title,
    "description": jobPosting.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": "LastMinuteJob",
      "value": currentUrl
    },
    "datePosted": jobPosting.datePosted || new Date().toISOString(),
    "employmentType": jobPosting.employmentType || "PART_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": jobPosting.company || "LastMinuteJob"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": jobPosting.location
      }
    },
    ...(jobPosting.baseSalary && {
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": jobPosting.baseSalary.currency || "EUR",
        "value": {
          "@type": "QuantitativeValue",
          ...(jobPosting.baseSalary.value.value && { "value": jobPosting.baseSalary.value.value }),
          ...(jobPosting.baseSalary.value.minValue && { "minValue": jobPosting.baseSalary.value.minValue }),
          ...(jobPosting.baseSalary.value.maxValue && { "maxValue": jobPosting.baseSalary.value.maxValue }),
          "unitText": "HOUR"
        }
      }
    })
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="fr_FR" />
      {jobPosting && (
        <>
          <meta property="og:type" content="article" />
          <meta property="article:author" content={jobPosting.company} />
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      {jobPostingSchema && (
        <script type="application/ld+json">
          {JSON.stringify(jobPostingSchema)}
        </script>
      )}
    </Helmet>
  );
}

