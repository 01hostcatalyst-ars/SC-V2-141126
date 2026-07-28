// ============================================================
// SignCollab Academy — Master Taxonomy & Content Architecture
// Source: SIGNCOLLAB ACADEMY MASTER CONTENT ARCHITECTURE BLUEPRINT
// ============================================================

// ----------------------------
// PILLAR DEFINITIONS (5 Pillars)
// ----------------------------

export interface Pillar {
  id: string;
  name: string;
  shortName: string;
  color: string;       // Primary CSS color
  bgColor: string;     // Light background
  borderColor: string; // Border accent
  description: string;
  allocation: string;
}

export const PILLARS: Pillar[] = [
  {
    id: "pillar-1",
    name: "Operations, Business Growth & Analytics",
    shortName: "Operations & Growth",
    color: "#2563eb",
    bgColor: "#eff6ff",
    borderColor: "#bfdbfe",
    description: "Creator business growth, campaign management, sourcing workflows, and performance analytics.",
    allocation: "40% / ~200 Nodes",
  },
  {
    id: "pillar-2",
    name: "Contracts, Clauses & Intellectual Property",
    shortName: "Contracts & IP",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    borderColor: "#c4b5fd",
    description: "Agreement types, clause deep-dives, content licensing, usage rights, and IP frameworks.",
    allocation: "30% / ~150 Nodes",
  },
  {
    id: "pillar-3",
    name: "AI, Emerging Platforms & Future Tech",
    shortName: "AI & Future Tech",
    color: "#0891b2",
    bgColor: "#ecfeff",
    borderColor: "#a5f3fc",
    description: "AI content ownership, synthetic influencers, voice licensing, platform compliance, and disclosure rules.",
    allocation: "10% / ~50 Nodes",
  },
  {
    id: "pillar-4",
    name: "Security, E-Sign Tech & Regional Law",
    shortName: "Security & Law",
    color: "#dc2626",
    bgColor: "#fef2f2",
    borderColor: "#fecaca",
    description: "E-signature infrastructure, audit trails, tamper-evident logs, and regional legal frameworks.",
    allocation: "10% / ~50 Nodes",
  },
  {
    id: "pillar-5",
    name: "Commercial Comparisons & Overlays",
    shortName: "Comparisons",
    color: "#ea580c",
    bgColor: "#fff7ed",
    borderColor: "#fed7aa",
    description: "SignCollab vs. competitors, templates, glossaries, downloadable frameworks, and checklists.",
    allocation: "10% / ~50 Nodes",
  },
];

// ----------------------------
// CLUSTER DEFINITIONS (C1 – C18)
// ----------------------------

export interface Cluster {
  id: string;         // "C1" through "C18"
  name: string;
  pillarId: string;
  audience: string;   // "All" | "Creators" | "Brands / Agencies" | etc.
  focus: string;
  nodeCount: number;
}

export const CLUSTERS: Cluster[] = [
  { id: "C1",  name: "Research & Benchmarks",       pillarId: "pillar-1", audience: "All",             focus: "Proprietary data studies, market trends, backlink magnets",                        nodeCount: 15 },
  { id: "C2",  name: "Creator Business & Pricing",  pillarId: "pillar-1", audience: "Creators",        focus: "Rate cards, media kits, pricing usage rights, monetization",                       nodeCount: 25 },
  { id: "C3",  name: "Sourcing & Outreach",          pillarId: "pillar-1", audience: "Brands / Agencies", focus: "Vetting creators, outreach SOPs, CRM, marketplaces",                            nodeCount: 20 },
  { id: "C4",  name: "Brand Procurement",            pillarId: "pillar-1", audience: "Brands",          focus: "Onboarding workflows, campaign briefing, gifting programs",                        nodeCount: 20 },
  { id: "C5",  name: "Agency Workflows",              pillarId: "pillar-1", audience: "Agencies",        focus: "Scaling operations, MSA/SOW setup, multi-party approvals",                        nodeCount: 25 },
  { id: "C6",  name: "Metrics & Analytics",           pillarId: "pillar-1", audience: "Brands / Agencies", focus: "CPM, CPE, EMV, revenue attribution, ROI tracking",                              nodeCount: 20 },
  { id: "C7",  name: "Pain Points & Disputes",       pillarId: "pillar-1", audience: "All",             focus: "Unpaid invoices, ghosting, scope creep, content misuse",                           nodeCount: 30 },
  { id: "C8",  name: "Agreement Types",               pillarId: "pillar-2", audience: "All",             focus: "UGC contracts, sponsorships, ambassador, affiliate, gifting",                      nodeCount: 25 },
  { id: "C9",  name: "Clause Deep-Dives",             pillarId: "pillar-2", audience: "All",             focus: "Deliverables, revision caps, kill fees, exclusivity, NDAs",                        nodeCount: 30 },
  { id: "C10", name: "Content IP & Licensing",        pillarId: "pillar-2", audience: "All",             focus: "Licensing vs. assignment, whitelisting, territorial scope",                        nodeCount: 25 },
  { id: "C11", name: "Cross-Border Operations",       pillarId: "pillar-2", audience: "Global Users",   focus: "International wires, currency, global VAT/taxes, W-8BEN",                          nodeCount: 15 },
  { id: "C12", name: "AI & Generative Rights",       pillarId: "pillar-3", audience: "All",             focus: "AI ownership, synthetic influencers, voice licensing, scraping",                    nodeCount: 15 },
  { id: "C13", name: "Social Platform Compliance",   pillarId: "pillar-3", audience: "All",             focus: "Instagram, TikTok, YouTube, LinkedIn disclosure rules",                            nodeCount: 20 },
  { id: "C14", name: "Competitor Comparisons",       pillarId: "pillar-5", audience: "Software Buyers", focus: "SignCollab vs. DocuSign, PandaDoc, Adobe Sign (High BOFU)",                        nodeCount: 15 },
  { id: "C15", name: "E-Sign Infrastructure",        pillarId: "pillar-4", audience: "Legal / Tech",    focus: "SES, AES, QES, SHA-256 hashing, PKI, OTP verification",                            nodeCount: 15 },
  { id: "C16", name: "Security & Audit Trails",      pillarId: "pillar-4", audience: "Legal / Ops",     focus: "Tamper-evident logs, audit logs, court evidence standards",                         nodeCount: 15 },
  { id: "C17", name: "Regional Legal Frameworks",    pillarId: "pillar-4", audience: "Legal / Ops",     focus: "ESIGN Act, eIDAS, UK ASA, UAE laws, Pakistan ETO",                                 nodeCount: 20 },
  { id: "C18", name: "Templates & Glossaries",       pillarId: "pillar-5", audience: "All",             focus: "Downloadable contract frameworks, checklists, single-term definitions",             nodeCount: 30 },
];

// ----------------------------
// LEARNING JOURNEYS (6 Guided Pathways)
// ----------------------------

export interface LearningJourney {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  steps: string[];
}

export const LEARNING_JOURNEYS: LearningJourney[] = [
  {
    id: "journey-1",
    name: "Solo Creator Pathway",
    color: "#2563eb",
    bgColor: "#eff6ff",
    steps: ["Media Kit Setup", "Rate Pricing", "Cold Outreach", "Deal Negotiation", "Contract Review", "Licensing Scope", "E-Signing", "Invoicing", "Tax Filing"],
  },
  {
    id: "journey-2",
    name: "Agency Scaling Pathway",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    steps: ["Client Pitching", "SOW/MSA Setup", "Creator Vetting", "Multi-Party Approvals", "Batch Contracting", "Automated Payouts", "Campaign Reporting"],
  },
  {
    id: "journey-3",
    name: "DTC Brand & E-Commerce Pathway",
    color: "#059669",
    bgColor: "#ecfdf5",
    steps: ["Campaign Budgeting", "Sourcing Creators", "Campaign Briefing", "Usage Rights", "Content Approvals", "Whitelisting/Ads", "ROI & EMV Tracking"],
  },
  {
    id: "journey-4",
    name: "Legal & Operations Compliance",
    color: "#dc2626",
    bgColor: "#fef2f2",
    steps: ["E-Sign Enforceability", "Audit Trail Verification", "Regional Laws (ESIGN/eIDAS)", "FTC Disclosures", "Dispute Resolution"],
  },
  {
    id: "journey-5",
    name: "Software Buyer Migration",
    color: "#ea580c",
    bgColor: "#fff7ed",
    steps: ["Legacy E-Sign Limits", "SignCollab vs. DocuSign", "SignCollab vs. PandaDoc", "Workflow Automation", "Agency Onboarding"],
  },
  {
    id: "journey-6",
    name: "AI & Future Tech Pioneer",
    color: "#0891b2",
    bgColor: "#ecfeff",
    steps: ["AI Content Ownership", "Synthetic Influencers", "Voice Licensing", "AI Scraping Prevention", "Disclosure Rules"],
  },
];

// ----------------------------
// BLUEPRINT TYPES
// ----------------------------

export type BlueprintType = "A" | "B" | "C";

export interface BlueprintInfo {
  type: BlueprintType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

export const BLUEPRINT_TYPES: Record<BlueprintType, BlueprintInfo> = {
  A: {
    type: "A",
    label: "Informational",
    description: "Technical definitions, explanations, and concept breakdowns.",
    color: "#2563eb",
    bgColor: "#eff6ff",
  },
  B: {
    type: "B",
    label: "Workflow",
    description: "Step-by-step guides, SOPs, and operational procedures.",
    color: "#059669",
    bgColor: "#ecfdf5",
  },
  C: {
    type: "C",
    label: "Legal / Compliance",
    description: "Legal frameworks, regulatory requirements, and enforceability guides.",
    color: "#dc2626",
    bgColor: "#fef2f2",
  },
};

// ----------------------------
// AUDIENCE TAGS
// ----------------------------

export interface AudienceTag {
  id: string;
  label: string;
  color: string;
  bgColor: string;
}

export const AUDIENCE_TAGS: Record<string, AudienceTag> = {
  Creators: { id: "creators", label: "Creators", color: "#7c3aed", bgColor: "#f5f3ff" },
  Brands: { id: "brands", label: "Brands", color: "#2563eb", bgColor: "#eff6ff" },
  Agencies: { id: "agencies", label: "Agencies", color: "#059669", bgColor: "#ecfdf5" },
  All: { id: "all", label: "Everyone", color: "#6b7280", bgColor: "#f9fafb" },
  "Brands / Agencies": { id: "brands-agencies", label: "Brands & Agencies", color: "#0891b2", bgColor: "#ecfeff" },
  "Global Users": { id: "global", label: "Global Users", color: "#ea580c", bgColor: "#fff7ed" },
  "Software Buyers": { id: "buyers", label: "Software Buyers", color: "#dc2626", bgColor: "#fef2f2" },
  "Legal / Tech": { id: "legal-tech", label: "Legal & Tech", color: "#dc2626", bgColor: "#fef2f2" },
  "Legal / Ops": { id: "legal-ops", label: "Legal & Ops", color: "#dc2626", bgColor: "#fef2f2" },
};

// ----------------------------
// HELPER FUNCTIONS
// ----------------------------

export function getClusterById(id: string): Cluster | undefined {
  return CLUSTERS.find((c) => c.id === id);
}

export function getPillarById(id: string): Pillar | undefined {
  return PILLARS.find((p) => p.id === id);
}

export function getClustersByPillar(pillarId: string): Cluster[] {
  return CLUSTERS.filter((c) => c.pillarId === pillarId);
}

export function getPillarForCluster(clusterId: string): Pillar | undefined {
  const cluster = getClusterById(clusterId);
  if (!cluster) return undefined;
  return getPillarById(cluster.pillarId);
}

export function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, "").trim();
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 225));
}
