/** Public entity IDs must remain stable across pages and environments. */
export const SITE_URL = 'https://www.signcollab.com';
export type SchemaNode = Record<string, unknown>;
export const organizationId = `${SITE_URL}/#organization`;
export const websiteId = `${SITE_URL}/#website`;
export const founderId = `${SITE_URL}/#founder`;
export function schemaUrl(path: string) { return new URL(path, SITE_URL).href; }
/** Safe even when text originates in a profile, Google Doc, or form. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
export function graph(nodes: SchemaNode[]) { return { '@context': 'https://schema.org', '@graph': nodes }; }
export function breadcrumbs(path: string, name: string, parents: Array<{path: string; name: string}> = []) {
  return { '@type': 'BreadcrumbList', '@id': `${schemaUrl(path)}#breadcrumb`, itemListElement:
    [{path: '/', name: 'Home'}, ...parents, {path, name}].map((item, index) => ({'@type': 'ListItem', position: index + 1, name: item.name, item: schemaUrl(item.path)})) };
}
export function pageNode(path: string, name: string, description: string, type = 'WebPage'): SchemaNode {
  return {'@type': type, '@id': schemaUrl(path), url: schemaUrl(path), name, description, inLanguage: 'en', isPartOf: {'@id': websiteId}, publisher: {'@id': organizationId}, about: {'@id': organizationId}, ...(path !== '/' ? {breadcrumb: {'@id': `${schemaUrl(path)}#breadcrumb`}} : {})};
}
export function faqNode(path: string, faqs: ReadonlyArray<{question: string; answer: string}>) {
  return {'@type': 'FAQPage', '@id': `${schemaUrl(path)}#faq`, isPartOf: {'@id': schemaUrl(path)}, mainEntity: faqs.map(item => ({'@type': 'Question', name: item.question, acceptedAnswer: {'@type': 'Answer', text: item.answer}}))};
}
export const founderNode = {'@type': 'Person', '@id': founderId, name: 'Muhammad Arsalan', jobTitle: 'Founder', url: schemaUrl('/about#founder'), image: schemaUrl('/founder.jpeg'), worksFor: {'@id': organizationId}, sameAs: ['https://www.linkedin.com/in/arsalananis/']};
export function siteGraph(company: {name: string; supportEmail: string}) {
  return graph([
    {'@type': 'Organization', '@id': organizationId, name: company.name, url: SITE_URL,
      description: 'Tools for creator discovery, estimated sponsorship rates, audience and content insights, and creator partnership agreements.',
      email: company.supportEmail, founder: {'@id': founderId}, logo: {'@type': 'ImageObject', '@id': `${SITE_URL}/#logo`, url: schemaUrl('/icon-512.png'), width: 512, height: 512},
      contactPoint: {'@type': 'ContactPoint', contactType: 'customer support', email: company.supportEmail, url: schemaUrl('/contact'), availableLanguage: ['English']},
      knowsAbout: ['Creator partnerships', 'Influencer marketing', 'Sponsorship rate estimation', 'Creator audience insights', 'Content licensing', 'Creator contracts', 'Document verification']},
    {'@type': 'WebSite', '@id': websiteId, name: company.name, url: SITE_URL, inLanguage: 'en', publisher: {'@id': organizationId}, description: 'Discover creators, compare platform performance and estimated rates, and build clear partnership agreements.'},
    {'@type': 'WebApplication', '@id': `${SITE_URL}/#webapp`, name: company.name, url: SITE_URL, applicationCategory: 'BusinessApplication', operatingSystem: 'Web browser', provider: {'@id': organizationId}, description: 'A web platform connecting creator discovery, sponsorship rate estimates, profile insights, and agreement tools.', featureList: ['Creator directory', 'Creator profiles and platform performance', 'Sponsorship rate calculator', 'Audience and content insights', 'Creator partnership contracts', 'Document verification']},
  ]);
}
