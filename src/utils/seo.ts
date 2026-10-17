// JSON-LD helpers for StudioLayout's `schema` prop. The studio itself (#studio) is declared once in the layout.
const SITE = 'https://strategicsloth.com/';

export const serviceSchema = (name: string, path: string, description: string, serviceType = name) => ({
  '@type': 'Service', name, serviceType, description, url: new URL(path, SITE).href,
  provider: { '@id': `${SITE}#studio` }, areaServed: 'Worldwide'
});

export const breadcrumbSchema = (crumbs: [string, string][]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: new URL(path, SITE).href }))
});

export const faqSchema = (items: [string, string][]) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
});
