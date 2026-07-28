import { google } from "googleapis";

import { BlueprintType, estimateReadingTime } from "./academy-data";

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  modifiedTime: string;
  createdTime?: string;
  mimeType: string;
  clusterId: string;
  blueprintType: BlueprintType;
  audience: string;
  readingTime?: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ArticleDetail extends ArticleSummary {
  contentHtml: string;
  faqs?: FaqItem[];
  toc?: { id: string; text: string; level: number }[];
}

/**
 * Classify article title into clusterId, blueprintType, and audience according to Master Content Architecture Blueprint
 */
export function classifyArticle(title: string): { clusterId: string; blueprintType: BlueprintType; audience: string } {
  const t = title.toLowerCase();

  // Match C14: Competitor Comparisons
  if (t.includes("v.") || t.includes("vs") || t.includes("docusign") || t.includes("pandadoc") || t.includes("adobe")) {
    return { clusterId: "C14", blueprintType: "A", audience: "Software Buyers" };
  }
  // Match C17 / C15: Legal / E-Sign Enforceability
  if (t.includes("legal") || t.includes("binding") || t.includes("esign act") || t.includes("eidas") || t.includes("eto") || t.includes("law")) {
    return { clusterId: "C17", blueprintType: "C", audience: "Legal / Ops" };
  }
  // Match C16: Security & Audit Trail
  if (t.includes("audit trail") || t.includes("tamper") || t.includes("evidence")) {
    return { clusterId: "C16", blueprintType: "A", audience: "Legal / Ops" };
  }
  // Match C15: Tech / Hash / PKI
  if (t.includes("sha-256") || t.includes("pki") || t.includes("otp") || t.includes("hash")) {
    return { clusterId: "C15", blueprintType: "A", audience: "Legal / Tech" };
  }
  // Match C18: Templates / Glossaries / Checklists
  if (t.includes("template") || t.includes("glossary") || t.includes("checklist") || t.includes("guide")) {
    return { clusterId: "C18", blueprintType: "B", audience: "All" };
  }
  // Match C10: Licensing & IP & Whitelisting
  if (t.includes("licensing") || t.includes("whitelisting") || t.includes("ip assignment") || t.includes("perpetual")) {
    return { clusterId: "C10", blueprintType: "A", audience: "All" };
  }
  // Match C9: Clause Deep-Dives
  if (t.includes("revision") || t.includes("kill fee") || t.includes("exclusivity") || t.includes("nda") || t.includes("clause")) {
    return { clusterId: "C9", blueprintType: "B", audience: "All" };
  }
  // Match C7: Pain Points & Disputes
  if (t.includes("didn't pay") || t.includes("doesn't pay") || t.includes("ghost") || t.includes("scam") || t.includes("dispute") || t.includes("unpaid")) {
    return { clusterId: "C7", blueprintType: "B", audience: "All" };
  }
  // Match C2: Creator Business & Pricing
  if (t.includes("rate") || t.includes("pricing") || t.includes("invoicing") || t.includes("usage rights")) {
    return { clusterId: "C2", blueprintType: "B", audience: "Creators" };
  }
  // Match C12: AI
  if (t.includes("ai") || t.includes("synthetic") || t.includes("voice")) {
    return { clusterId: "C12", blueprintType: "C", audience: "All" };
  }
  // Match C13: Social platform rules / FTC
  if (t.includes("ftc") || t.includes("instagram") || t.includes("tiktok") || t.includes("youtube")) {
    return { clusterId: "C13", blueprintType: "C", audience: "All" };
  }
  // Match C1: Data / Benchmarks
  if (t.includes("state of") || t.includes("report") || t.includes("statistics") || t.includes("benchmark")) {
    return { clusterId: "C1", blueprintType: "A", audience: "All" };
  }

  // Default fallback
  return { clusterId: "C8", blueprintType: "B", audience: "All" };
}

function getAuth() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error("Missing Google Service Account environment variables.");
  }

  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/documents.readonly",
    ],
  });
}

/**
 * Convert a title to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export const SEED_ARTICLES: ArticleSummary[] = [
  {
    id: "seed-1",
    slug: "what-to-do-when-a-brand-doesnt-pay-you-on-time",
    title: "What to Do When a Brand Doesn't Pay You On Time",
    excerpt: "Step-by-step operational and legal workflow for recovering unpaid invoices from brand partnerships, late fee enforcement, and automated escrow protection.",
    modifiedTime: new Date().toISOString(),
    mimeType: "application/vnd.google-apps.document",
    clusterId: "C7",
    blueprintType: "B",
    audience: "Creators",
    readingTime: 6,
  },
  {
    id: "seed-2",
    slug: "are-e-signatures-legally-binding-for-influencer-contracts",
    title: "Are E-Signatures Legally Binding for Influencer Contracts?",
    excerpt: "Comprehensive legal guide to ESIGN Act, eIDAS, and global electronic signature enforceability standards for creator and brand agreements.",
    modifiedTime: new Date().toISOString(),
    mimeType: "application/vnd.google-apps.document",
    clusterId: "C17",
    blueprintType: "C",
    audience: "Legal / Ops",
    readingTime: 8,
  },
  {
    id: "seed-3",
    slug: "signcollab-vs-docusign-for-influencer-marketing-agencies",
    title: "SignCollab vs. DocuSign for Influencer Marketing & Agencies",
    excerpt: "In-depth comparison of generic e-signature software vs. purpose-built creator partnership agreement infrastructure.",
    modifiedTime: new Date().toISOString(),
    mimeType: "application/vnd.google-apps.document",
    clusterId: "C14",
    blueprintType: "A",
    audience: "Software Buyers",
    readingTime: 7,
  },
  {
    id: "seed-4",
    slug: "how-to-set-and-calculate-creator-usage-rights-fees",
    title: "How to Set and Calculate Creator Usage Rights Fees",
    excerpt: "The exact pricing formula for organic vs. paid ad usage rights, dark posting, whitelisting, and perpetual licensing fees.",
    modifiedTime: new Date().toISOString(),
    mimeType: "application/vnd.google-apps.document",
    clusterId: "C2",
    blueprintType: "B",
    audience: "Creators",
    readingTime: 5,
  },
  {
    id: "seed-5",
    slug: "what-is-an-audit-trail-in-digital-agreements",
    title: "What Is an Audit Trail in Digital Agreements (And Why It Matters)?",
    excerpt: "Understanding SHA-256 cryptographic hashing, IP timestamps, and tamper-evident audit logs in court-admissible electronic contracts.",
    modifiedTime: new Date().toISOString(),
    mimeType: "application/vnd.google-apps.document",
    clusterId: "C16",
    blueprintType: "A",
    audience: "Legal / Tech",
    readingTime: 6,
  },
  {
    id: "seed-6",
    slug: "ugc-creator-contract-template-essential-clauses-guide",
    title: "UGC Creator Contract Template & Essential Clauses Guide",
    excerpt: "Downloadable UGC agreement structure covering deliverable specs, revision caps, payment terms, and commercial usage rights.",
    modifiedTime: new Date().toISOString(),
    mimeType: "application/vnd.google-apps.document",
    clusterId: "C18",
    blueprintType: "B",
    audience: "All",
    readingTime: 9,
  },
  {
    id: "seed-7",
    slug: "content-licensing-vs-ip-assignment-in-creator-deals",
    title: "Content Licensing vs. IP Assignment in Creator Deals",
    excerpt: "Why creators should never grant full IP assignment without severe pricing markups, and how licensing protects long-term brand equity.",
    modifiedTime: new Date().toISOString(),
    mimeType: "application/vnd.google-apps.document",
    clusterId: "C10",
    blueprintType: "A",
    audience: "All",
    readingTime: 7,
  },
  {
    id: "seed-8",
    slug: "state-of-creator-agreements-2027",
    title: "State of Creator Agreements 2027 (Data & Benchmarks Report)",
    excerpt: "SignCollab Academy's flagship annual research report analyzing payment timelines, dispute rates, and usage rights trends across 20,000+ agreements.",
    modifiedTime: new Date().toISOString(),
    mimeType: "application/vnd.google-apps.document",
    clusterId: "C1",
    blueprintType: "A",
    audience: "All",
    readingTime: 12,
  },
];

/**
 * Fetch all published Google Docs from the configured Drive folder
 */
export async function getKnowledgeArticles(): Promise<ArticleSummary[]> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    console.warn("GOOGLE_DRIVE_FOLDER_ID is not configured. Using SignCollab Academy seed blueprint articles.");
    return SEED_ARTICLES;
  }

  try {
    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.document'`,
      fields: "files(id, name, modifiedTime, createdTime, mimeType, description)",
      orderBy: "modifiedTime desc",
    });

    const files = res.data.files || [];

    if (files.length === 0) {
      return SEED_ARTICLES;
    }

    return files.map((file: any) => {
      const cleanTitle = file.name ? file.name.replace(/\.docx?$/i, "") : "Untitled Post";
      const classification = classifyArticle(cleanTitle);
      return {
        id: file.id,
        slug: slugify(cleanTitle),
        title: cleanTitle,
        excerpt: file.description || "Read full article on SignCollab Academy.",
        modifiedTime: file.modifiedTime || new Date().toISOString(),
        createdTime: file.createdTime || file.modifiedTime || new Date().toISOString(),
        mimeType: file.mimeType,
        ...classification,
        readingTime: 5,
      };
    });
  } catch (error) {
    console.error("Error fetching articles from Google Drive, returning seed articles:", error);
    return SEED_ARTICLES;
  }
}

/**
 * Extract FAQ questions & answers for FAQPage Schema
 * Only returns FAQs if a Genuine FAQ section (H2/H3 containing FAQ / Questions) exists.
 */

function extractFaqs(html: string): FaqItem[] {
  if (!html) return [];
  const faqs: FaqItem[] = [];

  // Check if document has FAQ section
  const hasFaqSection = /<h[23][^>]*>.*?(faq|frequently asked questions).*?<\/h[23]>/i.test(html);
  if (!hasFaqSection) {
    return [];
  }

  // Regex pattern to extract FAQ question and answer pairs
  // Looks for H2/H3 question headers ending with '?' or followed by paragraph text
  const regex = /<h[234][^>]*>(.*?\?.*?)<\/h[234]>\s*<p>(.*?)<\/p>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const question = match[1].replace(/<[^>]+>/g, "").trim();
    const answer = match[2].replace(/<[^>]+>/g, "").trim();
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  return faqs;
}

/**
 * Parse all SignCollab Academy parser tags from the blueprint.
 * Tags: [summary], [key-takeaways], [example], [warning], [legal-note],
 *       [country-note], [definition], [faq], [related-reading], [cta], [seo-metadata]
 *
 * NOTE: Uses class= (not className=) because this is injected via dangerouslySetInnerHTML.
 */
function parseShortcodes(html: string): string {
  if (!html) return "";

  let parsed = html;

  // [summary]...[/summary]
  parsed = parsed.replace(
    /\[summary\]([\s\S]*?)\[\/summary\]/gi,
    (_match, p1) => `
      <div class="academy-block academy-summary">
        <div class="academy-block-header">
          <span>Executive Summary</span>
        </div>
        <div class="academy-block-body">${p1}</div>
      </div>
    `
  );

  // [key-takeaways]...[/key-takeaways]
  parsed = parsed.replace(
    /\[key-takeaways\]([\s\S]*?)\[\/key-takeaways\]/gi,
    (_match, p1) => `
      <div class="academy-block academy-takeaways">
        <div class="academy-block-header">
          <span>Key Takeaways</span>
        </div>
        <div class="academy-block-body">${p1}</div>
      </div>
    `
  );

  // [example]...[/example]
  parsed = parsed.replace(
    /\[example\]([\s\S]*?)\[\/example\]/gi,
    (_match, p1) => `
      <div class="academy-block academy-example">
        <div class="academy-block-header">
          <span>Real-World Scenario</span>
        </div>
        <div class="academy-block-body">${p1}</div>
      </div>
    `
  );

  // [warning]...[/warning]
  parsed = parsed.replace(
    /\[warning\]([\s\S]*?)\[\/warning\]/gi,
    (_match, p1) => `
      <div class="academy-block academy-warning">
        <div class="academy-block-header">
          <span>Risk Warning</span>
        </div>
        <div class="academy-block-body">${p1}</div>
      </div>
    `
  );

  // [legal-note]...[/legal-note]
  parsed = parsed.replace(
    /\[legal-note\]([\s\S]*?)\[\/legal-note\]/gi,
    (_match, p1) => `
      <div class="academy-block academy-legal-note">
        <div class="academy-block-header">
          <span>Legal Disclaimer</span>
        </div>
        <div class="academy-block-body">${p1}</div>
      </div>
    `
  );

  // [country-note]...[/country-note]
  parsed = parsed.replace(
    /\[country-note\]([\s\S]*?)\[\/country-note\]/gi,
    (_match, p1) => `
      <div class="academy-block academy-country-note">
        <div class="academy-block-header">
          <span>Regional Notice</span>
        </div>
        <div class="academy-block-body">${p1}</div>
      </div>
    `
  );

  // [definition]...[/definition]
  parsed = parsed.replace(
    /\[definition\]([\s\S]*?)\[\/definition\]/gi,
    (_match, p1) => `
      <div class="academy-block academy-definition">
        <div class="academy-block-header">
          <span>Definition</span>
        </div>
        <div class="academy-block-body">${p1}</div>
      </div>
    `
  );

  // [faq]...[/faq]
  parsed = parsed.replace(
    /\[faq\]([\s\S]*?)\[\/faq\]/gi,
    (_match, p1) => `
      <div class="academy-block academy-faq">
        <div class="academy-block-header">
          <span>Frequently Asked Questions</span>
        </div>
        <div class="academy-block-body academy-faq-body">${p1}</div>
      </div>
    `
  );

  // [related-reading]...[/related-reading]
  parsed = parsed.replace(
    /\[related-reading\]([\s\S]*?)\[\/related-reading\]/gi,
    (_match, p1) => `
      <div class="academy-block academy-related-reading">
        <div class="academy-block-header">
          <span>Related Reading</span>
        </div>
        <div class="academy-block-body">${p1}</div>
      </div>
    `
  );

  // [cta]...[/cta] or [cta href="/instant"]...[/cta]
  parsed = parsed.replace(
    /\[cta(?:\s+href="([^"]+)")?\]([\s\S]*?)\[\/cta\]/gi,
    (_match, href, p1) => `
      <div class="academy-cta-block">
        <a href="${href || "/instant"}" class="academy-cta-link">
          <span>${p1 || "Create Agreement in SignCollab"}</span>
          <span>➔</span>
        </a>
      </div>
    `
  );

  // [seo-metadata]...[/seo-metadata] — strip from rendered output (metadata only)
  parsed = parsed.replace(
    /\[seo-metadata\]([\s\S]*?)\[\/seo-metadata\]/gi,
    ""
  );

  return parsed;
}

/**
 * Clean exported Google Doc HTML to match website typography & remove inline clutter
 */
function cleanGoogleDocHtml(html: string): string {
  if (!html) return "";

  // Extract body content if <body> tag exists
  let bodyContent = html;
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    bodyContent = bodyMatch[1];
  }

  // Remove Google Doc default inline styles and class names
  let cleaned = bodyContent
    .replace(/style="[^"]*"/gi, "") // strip inline style="..."
    .replace(/class="[^"]*"/gi, "") // strip class="..."
    .replace(/id="[^"]*"/gi, "") // strip Google doc ids
    .replace(/<span[^>]*>/gi, "") // flatten unnecessary spans
    .replace(/<\/span>/gi, "")
    .replace(/<p>\s*<\/p>/gi, ""); // strip empty paragraphs

  // Apply shortcodes replacement
  cleaned = parseShortcodes(cleaned);

  return cleaned.trim();
}

/**
 * Fetch a single Google Doc by slug or ID and return clean HTML content + FAQs
 */
export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const articles = await getKnowledgeArticles();
  const article = articles.find((a) => a.slug === slug || a.id === slug);

  if (!article) {
    return null;
  }

  // Handle seed articles
  if (article.id.startsWith("seed-")) {
    const rawContent = `
      [summary]
      This master operational guide explains the exact protocol for handling payment delays, enforcing late fees, and leveraging bilateral agreement logs to resolve disputes without litigation.
      [/summary]

      [key-takeaways]
      - Stop all ongoing content deliverables immediately upon reaching payment due date.
      - Send formal written notice referencing the signed contract timestamp and audit log ID.
      - Enforce standard 1.5% monthly late interest charges as specified in your agreement.
      - Use SignCollab's bilateral audit trail as binding evidence in formal escalation.
      [/key-takeaways]

      <h2>1. The Cost of Unmanaged Payment Delays</h2>
      <p>Unpaid invoices disrupt cash flow and compromise creator operations. When brands delay payment beyond agreed payment terms (Net-30 or Net-60), creators and agencies experience friction that impacts ongoing campaigns.</p>

      [warning]
      Never continue producing or publishing secondary campaign deliverables while previous milestone invoices remain unpaid. Continued work waives your operational leverage.
      [/warning]

      <h2>2. Step-by-Step Resolution Protocol</h2>
      <p>Follow this sequential four-step execution framework to recover outstanding funds while maintaining legal protection:</p>

      [example]
      Scenario: A brand marketer missed a Net-30 invoice deadline for a 3-video TikTok campaign.
      The Friction: The brand claimed internal accounting delays while continuing to run paid whitelisted ads using the creator's video.
      The Solution: The creator issued a formal Cease-and-Desist referencing Clause 4.2 of their SignCollab agreement, pausing paid ad rights until invoice settlement plus 1.5% late fee was confirmed.
      [/example]

      <h2>3. Governing Legal Framework & Enforceability</h2>
      <p>Electronic agreements executed with tamper-evident audit logs are fully admissible in court under regional electronic transaction acts.</p>

      [legal-note]
      This guide provides operational strategies and does not constitute formal legal advice. Contract enforceability varies by governing jurisdiction and regional laws.
      [/legal-note]

      [faq]
      ### What if the brand ignores all follow-up emails?
      Escalate by sending a formal demand letter via registered mail referencing the cryptographic hash of your signed SignCollab agreement.

      ### Can I revoke content usage rights if unpaid?
      Yes, standard contract clauses stipulate that IP licensing rights only transfer upon full settlement of contract fees.
      [/faq]

      [related-reading]
      - Are E-Signatures Legally Binding for Influencer Contracts?: Complete legal enforceability guide.
      - UGC Creator Contract Template & Essential Clauses Guide: Standard contract clause structures.
      - How to Set and Calculate Creator Usage Rights Fees: Complete usage rights pricing framework.
      [/related-reading]
    `;

    let contentHtml = cleanGoogleDocHtml(rawContent);

    const toc: { id: string; text: string; level: number }[] = [];
    let headingIndex = 0;
    contentHtml = contentHtml.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, levelStr, attrs, innerText) => {
      headingIndex++;
      const text = innerText.replace(/<[^>]+>/g, "").trim();
      if (!text) return match;
      const id = `section-${headingIndex}-${slugify(text.slice(0, 30))}`;
      const level = parseInt(levelStr, 10);
      toc.push({ id, text, level });
      return `<h${levelStr}${attrs} id="${id}">${innerText}</h${levelStr}>`;
    });

    return {
      ...article,
      contentHtml,
      faqs: [
        { question: "What if the brand ignores all follow-up emails?", answer: "Escalate by sending a formal demand letter via registered mail referencing the cryptographic hash of your signed SignCollab agreement." },
        { question: "Can I revoke content usage rights if unpaid?", answer: "Yes, standard contract clauses stipulate that IP licensing rights only transfer upon full settlement of contract fees." }
      ],
      toc,
      readingTime: article.readingTime || 6,
    };
  }

  try {
    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth });

    // Export Google Doc as HTML
    const exportRes = await drive.files.export({
      fileId: article.id,
      mimeType: "text/html",
    });

    const rawHtml = typeof exportRes.data === "string" ? exportRes.data : String(exportRes.data);
    let contentHtml = cleanGoogleDocHtml(rawHtml);
    const faqs = extractFaqs(rawHtml);

    // Extract TOC and inject IDs into headings
    const toc: { id: string; text: string; level: number }[] = [];
    let headingIndex = 0;
    contentHtml = contentHtml.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, levelStr, attrs, innerText) => {
      headingIndex++;
      const text = innerText.replace(/<[^>]+>/g, "").trim();
      if (!text) return match;
      const id = `section-${headingIndex}-${slugify(text.slice(0, 30))}`;
      const level = parseInt(levelStr, 10);
      toc.push({ id, text, level });
      return `<h${levelStr}${attrs} id="${id}">${innerText}</h${levelStr}>`;
    });

    const readingTime = estimateReadingTime(contentHtml);

    return {
      ...article,
      contentHtml,
      faqs: faqs.length > 0 ? faqs : undefined,
      toc: toc.length > 0 ? toc : undefined,
      readingTime,
    };
  } catch (error) {
    console.error(`Error exporting Google Doc ID ${article.id}:`, error);
    return null;
  }
}
