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
  icon: string;
  color: string;       // Primary CSS color
  bgColor: string;     // Light background
  borderColor: string; // Border accent
  description: string;
  allocation: string;  // e.g. "40% / ~200 Nodes"
}

export const PILLARS: Pillar[] = [
  {
    id: "pillar-1",
    name: "Operations, Business Growth & Analytics",
    shortName: "Operations & Growth",
    icon: "📊",
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
    icon: "📝",
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
    icon: "🤖",
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
    icon: "🔒",
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
    icon: "⚖️",
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
  icon: string;
}

export const CLUSTERS: Cluster[] = [
  { id: "C1",  name: "Research & Benchmarks",       pillarId: "pillar-1", audience: "All",             focus: "Proprietary data studies, market trends, backlink magnets",                        nodeCount: 15, icon: "📈" },
  { id: "C2",  name: "Creator Business & Pricing",  pillarId: "pillar-1", audience: "Creators",        focus: "Rate cards, media kits, pricing usage rights, monetization",                       nodeCount: 25, icon: "💰" },
  { id: "C3",  name: "Sourcing & Outreach",          pillarId: "pillar-1", audience: "Brands / Agencies", focus: "Vetting creators, outreach SOPs, CRM, marketplaces",                            nodeCount: 20, icon: "🔍" },
  { id: "C4",  name: "Brand Procurement",            pillarId: "pillar-1", audience: "Brands",          focus: "Onboarding workflows, campaign briefing, gifting programs",                        nodeCount: 20, icon: "🏢" },
  { id: "C5",  name: "Agency Workflows",              pillarId: "pillar-1", audience: "Agencies",        focus: "Scaling operations, MSA/SOW setup, multi-party approvals",                        nodeCount: 25, icon: "🏗️" },
  { id: "C6",  name: "Metrics & Analytics",           pillarId: "pillar-1", audience: "Brands / Agencies", focus: "CPM, CPE, EMV, revenue attribution, ROI tracking",                              nodeCount: 20, icon: "📉" },
  { id: "C7",  name: "Pain Points & Disputes",       pillarId: "pillar-1", audience: "All",             focus: "Unpaid invoices, ghosting, scope creep, content misuse",                           nodeCount: 30, icon: "⚠️" },
  { id: "C8",  name: "Agreement Types",               pillarId: "pillar-2", audience: "All",             focus: "UGC contracts, sponsorships, ambassador, affiliate, gifting",                      nodeCount: 25, icon: "📋" },
  { id: "C9",  name: "Clause Deep-Dives",             pillarId: "pillar-2", audience: "All",             focus: "Deliverables, revision caps, kill fees, exclusivity, NDAs",                        nodeCount: 30, icon: "🔎" },
  { id: "C10", name: "Content IP & Licensing",        pillarId: "pillar-2", audience: "All",             focus: "Licensing vs. assignment, whitelisting, territorial scope",                        nodeCount: 25, icon: "©️" },
  { id: "C11", name: "Cross-Border Operations",       pillarId: "pillar-2", audience: "Global Users",   focus: "International wires, currency, global VAT/taxes, W-8BEN",                          nodeCount: 15, icon: "🌍" },
  { id: "C12", name: "AI & Generative Rights",       pillarId: "pillar-3", audience: "All",             focus: "AI ownership, synthetic influencers, voice licensing, scraping",                    nodeCount: 15, icon: "🧠" },
  { id: "C13", name: "Social Platform Compliance",   pillarId: "pillar-3", audience: "All",             focus: "Instagram, TikTok, YouTube, LinkedIn disclosure rules",                            nodeCount: 20, icon: "📱" },
  { id: "C14", name: "Competitor Comparisons",       pillarId: "pillar-5", audience: "Software Buyers", focus: "SignCollab vs. DocuSign, PandaDoc, Adobe Sign (High BOFU)",                        nodeCount: 15, icon: "🆚" },
  { id: "C15", name: "E-Sign Infrastructure",        pillarId: "pillar-4", audience: "Legal / Tech",    focus: "SES, AES, QES, SHA-256 hashing, PKI, OTP verification",                            nodeCount: 15, icon: "✍️" },
  { id: "C16", name: "Security & Audit Trails",      pillarId: "pillar-4", audience: "Legal / Ops",     focus: "Tamper-evident logs, audit logs, court evidence standards",                         nodeCount: 15, icon: "🛡️" },
  { id: "C17", name: "Regional Legal Frameworks",    pillarId: "pillar-4", audience: "Legal / Ops",     focus: "ESIGN Act, eIDAS, UK ASA, UAE laws, Pakistan ETO",                                 nodeCount: 20, icon: "⚖️" },
  { id: "C18", name: "Templates & Glossaries",       pillarId: "pillar-5", audience: "All",             focus: "Downloadable contract frameworks, checklists, single-term definitions",             nodeCount: 30, icon: "📄" },
];

// ----------------------------
// LEARNING JOURNEYS (6 Guided Pathways)
// ----------------------------

export interface LearningJourney {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  steps: string[];
}

export const LEARNING_JOURNEYS: LearningJourney[] = [
  {
    id: "journey-1",
    name: "Solo Creator Pathway",
    icon: "🎨",
    color: "#2563eb",
    bgColor: "#eff6ff",
    steps: ["Media Kit Setup", "Rate Pricing", "Cold Outreach", "Deal Negotiation", "Contract Review", "Licensing Scope", "E-Signing", "Invoicing", "Tax Filing"],
  },
  {
    id: "journey-2",
    name: "Agency Scaling Pathway",
    icon: "🏢",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    steps: ["Client Pitching", "SOW/MSA Setup", "Creator Vetting", "Multi-Party Approvals", "Batch Contracting", "Automated Payouts", "Campaign Reporting"],
  },
  {
    id: "journey-3",
    name: "DTC Brand & E-Commerce Pathway",
    icon: "🛒",
    color: "#059669",
    bgColor: "#ecfdf5",
    steps: ["Campaign Budgeting", "Sourcing Creators", "Campaign Briefing", "Usage Rights", "Content Approvals", "Whitelisting/Ads", "ROI & EMV Tracking"],
  },
  {
    id: "journey-4",
    name: "Legal & Operations Compliance",
    icon: "⚖️",
    color: "#dc2626",
    bgColor: "#fef2f2",
    steps: ["E-Sign Enforceability", "Audit Trail Verification", "Regional Laws (ESIGN/eIDAS)", "FTC Disclosures", "Dispute Resolution"],
  },
  {
    id: "journey-5",
    name: "Software Buyer Migration",
    icon: "💻",
    color: "#ea580c",
    bgColor: "#fff7ed",
    steps: ["Legacy E-Sign Limits", "SignCollab vs. DocuSign", "SignCollab vs. PandaDoc", "Workflow Automation", "Agency Onboarding"],
  },
  {
    id: "journey-6",
    name: "AI & Future Tech Pioneer",
    icon: "🤖",
    color: "#0891b2",
    bgColor: "#ecfeff",
    steps: ["AI Content Ownership", "Synthetic Influencers", "Voice Licensing", "AI Scraping Prevention", "Disclosure Rules"],
  },
];

// ----------------------------
// INTERACTIVE TOOLS / CALCULATORS (9 Tools)
// ----------------------------

export interface InteractiveTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  ctaText: string;
}

export const INTERACTIVE_TOOLS: InteractiveTool[] = [
  {
    id: "creator-rate-calculator",
    name: "Creator Rate Calculator",
    description: "Calculate fair creator rates based on platform, followers, engagement, niche, and deliverable type.",
    icon: "💵",
    color: "#059669",
    bgColor: "#ecfdf5",
    ctaText: "Generate a formal rate card agreement with these terms in SignCollab.",
  },
  {
    id: "usage-rights-calculator",
    name: "Usage Rights Calculator",
    description: "Multiply base creator fees by duration index and channel scope for accurate usage licensing.",
    icon: "📐",
    color: "#2563eb",
    bgColor: "#eff6ff",
    ctaText: "Lock in these exact usage rights parameters in a binding agreement.",
  },
  {
    id: "contract-risk-checker",
    name: "Contract Risk Checker",
    description: "Scan contract clauses for red flags like unlimited revisions, perpetual assignment, or Net-90 payment.",
    icon: "🔴",
    color: "#dc2626",
    bgColor: "#fef2f2",
    ctaText: "Replace high-risk contracts with a pre-vetted SignCollab template.",
  },
  {
    id: "revision-cost-calculator",
    name: "Revision Cost Calculator",
    description: "Calculate uncompensated hours and total overage fees from excessive revision requests.",
    icon: "🔄",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    ctaText: "Enforce revision caps automatically using SignCollab agreement workflows.",
  },
  {
    id: "campaign-budget-calculator",
    name: "Campaign Budget Calculator",
    description: "Allocate budgets across creator fees, licensing, and agency overhead by creator tier.",
    icon: "💼",
    color: "#0891b2",
    bgColor: "#ecfeff",
    ctaText: "Create and batch-send agreements for this entire campaign budget.",
  },
  {
    id: "influencer-roi-calculator",
    name: "Influencer ROI Calculator",
    description: "Calculate net ROI percentage and Cost Per Acquisition from campaign spend vs. revenue.",
    icon: "📊",
    color: "#ea580c",
    bgColor: "#fff7ed",
    ctaText: "Track deliverable status and contractual milestones directly in SignCollab.",
  },
  {
    id: "emv-calculator",
    name: "EMV Calculator",
    description: "Apply industry-standard Earned Media Value multiplier rates per engagement metric per platform.",
    icon: "📈",
    color: "#059669",
    bgColor: "#ecfdf5",
    ctaText: "Include EMV performance benchmarks inside your campaign briefs.",
  },
  {
    id: "license-cost-calculator",
    name: "License Cost Calculator",
    description: "Calculate commercial licensing costs based on media type, distribution geography, and duration.",
    icon: "🌐",
    color: "#2563eb",
    bgColor: "#eff6ff",
    ctaText: "Attach a standardized commercial licensing addendum to your contract.",
  },
  {
    id: "exclusivity-cost-calculator",
    name: "Exclusivity Cost Calculator",
    description: "Calculate required fee markup compensating creators for lost market opportunities during exclusivity.",
    icon: "🔒",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    ctaText: "Add an enforceable exclusivity clause to your SignCollab agreement.",
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
  icon: string;
  color: string;
  bgColor: string;
}

export const BLUEPRINT_TYPES: Record<BlueprintType, BlueprintInfo> = {
  A: {
    type: "A",
    label: "Informational",
    description: "Technical definitions, explanations, and concept breakdowns.",
    icon: "📖",
    color: "#2563eb",
    bgColor: "#eff6ff",
  },
  B: {
    type: "B",
    label: "Workflow",
    description: "Step-by-step guides, SOPs, and operational procedures.",
    icon: "⚙️",
    color: "#059669",
    bgColor: "#ecfdf5",
  },
  C: {
    type: "C",
    label: "Legal / Compliance",
    description: "Legal frameworks, regulatory requirements, and enforceability guides.",
    icon: "⚖️",
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
  icon: string;
  color: string;
  bgColor: string;
}

export const AUDIENCE_TAGS: Record<string, AudienceTag> = {
  Creators: { id: "creators", label: "Creators", icon: "🎨", color: "#7c3aed", bgColor: "#f5f3ff" },
  Brands: { id: "brands", label: "Brands", icon: "🏢", color: "#2563eb", bgColor: "#eff6ff" },
  Agencies: { id: "agencies", label: "Agencies", icon: "🏗️", color: "#059669", bgColor: "#ecfdf5" },
  All: { id: "all", label: "Everyone", icon: "👥", color: "#6b7280", bgColor: "#f9fafb" },
  "Brands / Agencies": { id: "brands-agencies", label: "Brands & Agencies", icon: "🤝", color: "#0891b2", bgColor: "#ecfeff" },
  "Global Users": { id: "global", label: "Global Users", icon: "🌍", color: "#ea580c", bgColor: "#fff7ed" },
  "Software Buyers": { id: "buyers", label: "Software Buyers", icon: "💻", color: "#dc2626", bgColor: "#fef2f2" },
  "Legal / Tech": { id: "legal-tech", label: "Legal & Tech", icon: "🔒", color: "#dc2626", bgColor: "#fef2f2" },
  "Legal / Ops": { id: "legal-ops", label: "Legal & Ops", icon: "⚖️", color: "#dc2626", bgColor: "#fef2f2" },
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
