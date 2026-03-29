import { Helmet } from 'react-helmet-async';
import { BASE_URL } from '../utils/seo';

interface SEOHeadProps {
  title: string;
  description: string;
  ogImage?: string;
  canonicalUrl?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  lang?: 'en' | 'fr' | 'ar';
  keywords?: string;
}

export default function SEOHead({
  title,
  description,
  ogImage = `${BASE_URL}/favicon.png`,
  canonicalUrl,
  jsonLd,
  noindex = false,
  lang,
  keywords,
}: SEOHeadProps) {
  const fullTitle = title.includes('Eventra') ? title : `${title} | Eventra`;
  const isRTL = lang === 'ar';

  const jsonLdArray = jsonLd
    ? Array.isArray(jsonLd) ? jsonLd : [jsonLd]
    : [];

  return (
    <Helmet>
      {lang && <html lang={lang} dir={isRTL ? 'rtl' : 'ltr'} />}

      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {canonicalUrl && <link rel="alternate" hrefLang="en" href={`${canonicalUrl}?lang=en`} />}
      {canonicalUrl && <link rel="alternate" hrefLang="fr" href={`${canonicalUrl}?lang=fr`} />}
      {canonicalUrl && <link rel="alternate" hrefLang="ar" href={`${canonicalUrl}?lang=ar`} />}
      {canonicalUrl && <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Eventra" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLdArray.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
    </Helmet>
  );
}
