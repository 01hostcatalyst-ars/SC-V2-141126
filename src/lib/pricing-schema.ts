import { breadcrumbs, faqNode, graph, organizationId, pageNode, schemaUrl } from './structured-data';

/** Actual subscriptions only. This is unrelated to estimated creator rate benchmarks. */
export function pricingSchema(annual: boolean, faqs: Array<{q: string; a: string}>) {
  const plans = [
    {name: 'Starter', price: 0, description: 'Up to 2 instant agreements per day.'},
    {name: 'Professional', price: annual ? 150 : 9.5, description: annual ? 'Billed annually at $150 per year. Up to 250 agreements per month.' : '$9.50 per month for the first 3 months, then $19 per month. Up to 250 agreements per month.'},
    {name: 'Business', price: annual ? 312 : 19.5, description: annual ? 'Billed annually at $312 per year. Up to 1,000 agreements per month.' : '$19.50 per month for the first 3 months, then $39 per month. Up to 1,000 agreements per month.'},
    {name: 'Team', price: annual ? 630 : 39.5, description: annual ? 'Billed annually at $630 per year. Up to 2,500 agreements per month and 5 seats.' : '$39.50 per month for the first 3 months, then $79 per month. Up to 2,500 agreements per month and 5 seats.'},
  ];
  return graph([
    {...pageNode('/pricing', 'SignCollab pricing plans', 'Compare subscription plans for creator partnership agreements.'), mainEntity: {'@id': schemaUrl('/pricing#plans')}},
    breadcrumbs('/pricing', 'Pricing'),
    {'@type': 'OfferCatalog', '@id': schemaUrl('/pricing#plans'), name: 'SignCollab subscription plans', itemListElement: [
      ...plans.map(plan=>({'@type':'Offer',name:plan.name,description:plan.description,url:schemaUrl('/pricing'),seller:{'@id':organizationId},price:plan.price,priceCurrency:'USD', ...(plan.price ? {priceSpecification:{'@type':'UnitPriceSpecification',price:plan.price,priceCurrency:'USD',unitText:annual ? 'year' : 'month',...(annual ? {} : {description:'Introductory monthly price for the first 3 months.'})}} : {}),itemOffered:{'@type':'Service',name:`SignCollab ${plan.name} subscription`,provider:{'@id':organizationId}}})),
      {'@type':'Offer',name:'Enterprise',description:'Contact sales for custom volume and team requirements.',url:schemaUrl('/contact'),seller:{'@id':organizationId},itemOffered:{'@type':'Service',name:'SignCollab Enterprise subscription',provider:{'@id':organizationId}}},
    ]},
    faqNode('/pricing', faqs.filter(faq=>!faq.q.includes('legally binding')).map(faq=>({question:faq.q,answer:faq.a}))),
  ]);
}
