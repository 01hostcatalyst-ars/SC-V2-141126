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

export interface ArticleDetail extends ArticleSummary {
  contentHtml: string;
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

  return cleaned.trim();
}

/**
 * Fetch a single Google Doc by slug or ID and return clean HTML content
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

    return {
      ...article,
      contentHtml,
    };
  } catch (error) {
    console.error(`Error exporting Google Doc ID ${article.id}:`, error);
    return null;
  }
}
