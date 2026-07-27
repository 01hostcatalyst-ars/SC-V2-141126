import { google } from "googleapis";

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  modifiedTime: string;
  createdTime?: string;
  mimeType: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ArticleDetail extends ArticleSummary {
  contentHtml: string;
  faqs?: FaqItem[];
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

/**
 * Fetch all published Google Docs from the configured Drive folder
 */
export async function getKnowledgeArticles(): Promise<ArticleSummary[]> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    console.warn("GOOGLE_DRIVE_FOLDER_ID is not configured.");
    return [];
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

    return files.map((file: any) => {
      const cleanTitle = file.name ? file.name.replace(/\.docx?$/i, "") : "Untitled Post";
      return {
        id: file.id,
        slug: slugify(cleanTitle),
        title: cleanTitle,
        excerpt: file.description || "Read full article on SignCollab Knowledge Center.",
        modifiedTime: file.modifiedTime || new Date().toISOString(),
        createdTime: file.createdTime || file.modifiedTime || new Date().toISOString(),
        mimeType: file.mimeType,
      };
    });
  } catch (error) {
    console.error("Error fetching articles from Google Drive:", error);
    return [];
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
 * Parse lightweight Google Doc shortcodes:
 * [key-takeaways]...[/key-takeaways]
 * [summary]...[/summary]
 * [cta]Text[/cta]
 */
function parseShortcodes(html: string): string {
  if (!html) return "";

  let parsed = html;

  // [key-takeaways]...[/key-takeaways]
  parsed = parsed.replace(
    /\[key-takeaways\]([\s\S]*?)\[\/key-takeaways\]/gi,
    (_match, p1) => `
      <div className="gdoc-key-takeaways my-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase tracking-wider text-blue-900">
          <span>💡</span> Key Takeaways (TL;DR)
        </div>
        <div className="text-xs md:text-sm text-gray-700 leading-relaxed font-medium">
          ${p1}
        </div>
      </div>
    `
  );

  // [summary]...[/summary]
  parsed = parsed.replace(
    /\[summary\]([\s\S]*?)\[\/summary\]/gi,
    (_match, p1) => `
      <div className="gdoc-summary-box my-6 p-5 bg-gray-50 border border-gray-200 rounded-2xl text-xs md:text-sm text-gray-700 leading-relaxed">
        ${p1}
      </div>
    `
  );

  // [cta]...[/cta] or [cta href="/instant"]...[/cta]
  parsed = parsed.replace(
    /\[cta(?:\s+href="([^"]+)")?\]([\s\S]*?)\[\/cta\]/gi,
    (_match, href, p1) => `
      <div className="my-8 text-center sm:text-left">
        <a href="${href || "/instant"}" className="inline-flex items-center gap-2 px-6 py-3.5 bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all hover:scale-[1.01]">
          <span>${p1 || "Create Agreement Instant"}</span>
          <span>➔</span>
        </a>
      </div>
    `
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

  try {
    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth });

    // Export Google Doc as HTML
    const exportRes = await drive.files.export({
      fileId: article.id,
      mimeType: "text/html",
    });

    const rawHtml = typeof exportRes.data === "string" ? exportRes.data : String(exportRes.data);
    const contentHtml = cleanGoogleDocHtml(rawHtml);
    const faqs = extractFaqs(rawHtml);

    return {
      ...article,
      contentHtml,
      faqs: faqs.length > 0 ? faqs : undefined,
    };
  } catch (error) {
    console.error(`Error exporting Google Doc ID ${article.id}:`, error);
    return null;
  }
}
