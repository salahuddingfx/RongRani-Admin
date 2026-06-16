import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../contexts/LanguageContext';

const DEFAULT_TITLE = 'RongRani™ | Handmade Gifts in Bangladesh';
const DEFAULT_DESCRIPTION =
  'RongRani™ is Bangladesh\'s premium online shop for handmade surprise boxes, customized jewelry, and bespoke gift hampers. Fast delivery nationwide from Cox\'s Bazar.';
const DEFAULT_KEYWORDS = [
  'RongRani',
  'handmade gifts Bangladesh',
  'bespoke surprise boxes',
  'RongRani online store',
  'Cox\'s Bazar handmade treasures',
  'customized jewelry bd'
];

const normalizeUrl = (baseUrl, path) => {
  if (!path) {
    return baseUrl;
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (path.startsWith('/')) {
    return `${baseUrl}${path}`;
  }

  return `${baseUrl}/${path}`;
};

const resolveImageUrl = (baseUrl, image) => {
  if (!image) {
    return '';
  }

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  return normalizeUrl(baseUrl, image);
};

const Seo = ({ title, description, keywords, path, image, noIndex = false, schema, type = 'website', extraMeta = [] }) => {
  const { language } = useLanguage();

  const baseUrl = (import.meta?.env?.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://rongrani.vercel.app')).replace(/\/+$/, '');
  const canonical = normalizeUrl(baseUrl, path || '/');
  const metaTitle = title || DEFAULT_TITLE;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const metaKeywords = keywords
    ? (Array.isArray(keywords) ? keywords.join(', ') : keywords)
    : DEFAULT_KEYWORDS.join(', ');
  const imageUrl =
    resolveImageUrl(baseUrl, image) || normalizeUrl(baseUrl, '/RongRani-Circle.png');

  const htmlLang = language === 'bn' ? 'bn' : 'en';
  const ogLocale = language === 'bn' ? 'bn_BD' : 'en_BD';

  return (
    <Helmet htmlAttributes={{ lang: htmlLang }}>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      {metaKeywords && <meta name="keywords" content={metaKeywords} />}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonical} />
      <meta property="og:site_name" content="RongRani" />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:country-name" content="Bangladesh" />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${metaTitle} - RongRani`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:url" content={canonical} />
      {extraMeta.map((meta, index) => {
        const key = `${meta.property || meta.name}-${index}`;
        if (meta.property) {
          return <meta key={key} property={meta.property} content={meta.content} />;
        }
        if (meta.name) {
          return <meta key={key} name={meta.name} content={meta.content} />;
        }
        return null;
      })}
      {schema ? (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      ) : null}
    </Helmet>
  );
};

export default Seo;
