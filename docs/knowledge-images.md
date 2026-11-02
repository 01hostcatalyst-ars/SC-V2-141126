# Images in Knowledge Base articles

Insert an actual image in Google Docs between the opening marker and its alt-text block:

```text
<hero-image>
[insert the image here]
<alt-text>A concise description of the image</alt-text>
</hero-image>
```

Use the same structure for `<article1-image>`, `<article2-image>`, `<diagram1-image>`, `<square1-image>`, and higher numbers. The markers are ordinary text in Google Docs; they disappear from the website.

- The first valid hero is placed below the article header and used for Open Graph, Twitter and Article image metadata.
- Other images remain in document order. Diagrams retain their full aspect ratio; square images are centered with a maximum desktop width of 440px.
- Explicit `<alt-text>` supplies the accessible image description. An empty block means decorative alt text; if the block is absent, the Google Docs image alt attribute is used.
- Width and height come from the embedded image. The hero loads eagerly; inline images load lazily.
- Additional hero blocks render inline. Duplicate identifiers receive a unique suffix.

The tested Google Docs HTML export embeds JPEG and PNG images. Embedded WebP is supported as well. Unsupported or missing image data produces a text placeholder; SVG, arbitrary external URLs and other executable content are not served by the image endpoint.

Images are served at `/knowledge/[slug]/images/[imageId]?v=[document-modified-time]` directly from the document snapshot. No separate image bucket or upload is needed. Article data and generated article pages revalidate after 30 days (2,592,000 seconds). Image responses also cache for 30 days and use revision-specific URLs so later document updates receive new image URLs. Old or missing revision parameters redirect to the current version.

The catalogue list still revalidates every 60 seconds so new articles can appear in the library. Editing an existing Google Doc does not immediately refresh its cached article: allow revalidation after 30 days, or redeploy to refresh sooner. Cache keys include the deployment version. Failed article lookups/exports are not stored as long-lived null entries.

Keep source files compressed (ideally around 200KB or less). The raster reader limits decoded dimensions and accepts up to approximately 5MB per embedded image; large documents are also subject to Google export and Next.js cache limits.

Verification:

```powershell
node --test tests/knowledge-images.test.cjs tests/knowledge-seo.test.cjs tests/knowledge-related.test.cjs
```
