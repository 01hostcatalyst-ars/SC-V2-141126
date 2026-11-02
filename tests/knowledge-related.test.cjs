const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {relatedReadingHtml}=require('../src/lib/knowledge-related.ts');
const articles=[
 {title:'Are E-Signatures Legally Binding for Influencer Contracts?',slug:'are-e-signatures-legally-binding-for-influencer-contracts'},
 {title:'What Is an Audit Trail in Digital Agreements (And Why It Matters)',slug:'what-is-an-audit-trail-in-digital-agreements-and-why-it-matters'},
 {title:'How to Reject Unfair Contract Clauses Without Losing the Deal',slug:'how-to-reject-unfair-contract-clauses-without-losing-the-deal'}
];
const bullets=`- Are E-Signatures Legally Binding for Influencer Contracts: The signature rules that decide whether an electronic agreement holds up, alongside the message rules in this article.
- What Is an Audit Trail in Digital Agreements (And Why It Matters): Why a tamper-evident record beats a screenshot when a deal is disputed.
- How to Reject Unfair Contract Clauses Without Losing the Deal: How to challenge a term you never meant to accept, whether it appeared in a contract or a chat.`;
test('the supplied title:description format resolves all three exact published routes',()=>{
 const html=relatedReadingHtml(bullets,articles);for(const article of articles)assert(html.includes(`href="/knowledge/${article.slug}"`));assert.equal((html.match(/<a /g)||[]).length,3);assert(html.includes('Why a tamper-evident record beats a screenshot'));assert(!html.includes('localhost'));assert(!html.includes('http'));
});
test('Google Docs lists, nested paragraphs, inline formatting and entities are supported',()=>{
 const html=relatedReadingHtml(`<ul><li><p><strong>${articles[0].title}</strong>: Keep the signature rules.</p></li><li><p>${articles[1].title}: Keep the audit record.</p></li></ul>`,articles);assert.equal((html.match(/<a /g)||[]).length,2);assert(!html.includes('<strong>'));assert(html.includes('Keep the signature rules.'));
 const amp=relatedReadingHtml('<p>- Contracts &amp; rights: Keep ownership clear.</p>',[{title:'Contracts & Rights',slug:'contracts-rights'}]);assert(amp.includes('href="/knowledge/contracts-rights"'));
});
test('paragraph bullets and closing shortcode paragraph fragments do not create empty entries',()=>{
 const html=relatedReadingHtml(`</p><p>- ${articles[0].title}: One.</p><p>- ${articles[1].title}: Two.</p><p>`,articles);assert.equal((html.match(/<li>/g)||[]).length,2);
});
test('closing the shortcode inside the final Google Docs bullet does not drop that article',()=>{
 const html=relatedReadingHtml(`<ul><li>${articles[0].title}: One.</li><li>${articles[1].title}: Two.</li><li><p>${articles[2].title}: Three. `,articles);
 assert.equal((html.match(/<a /g)||[]).length,3);assert(html.includes('Three.'));
});
test('existing localhost, production and Google-wrapped links become site-relative',()=>{
 const slug=articles[0].slug;for(const url of [`http://localhost:3001/knowledge/${slug}`,`https://www.signcollab.com/knowledge/${slug}?source=doc`,`https://www.google.com/url?q=${encodeURIComponent(`http://localhost:3001/knowledge/${slug}`)}&amp;sa=D`]){
 const html=relatedReadingHtml(`<li><a href="${url}">Read the guide</a>: Signature rules.</li>`,articles);assert(html.includes(`href="/knowledge/${slug}"`));assert(!html.includes('localhost'));assert(html.includes('Signature rules.'));
 }
});
test('titles with colons use the actual title boundary rather than a guessed slug',()=>{
 const html=relatedReadingHtml('- Usage Rights: A Practical Guide: Keep this explanation.',[{title:'Usage Rights: A Practical Guide',slug:'actual-existing-route'}]);assert(html.includes('href="/knowledge/actual-existing-route"'));assert(html.includes('<p>Keep this explanation.</p>'));
});
test('unpublished, ambiguous and current-article titles remain plain text',()=>{
 assert(!relatedReadingHtml('- Unpublished Guide: Not available.',articles).includes('<a '));assert(!relatedReadingHtml(`- ${articles[0].title}: Self.`,articles,articles[0].slug).includes('<a '));assert(!relatedReadingHtml('- A Guide: Explanation.',[{title:'A Guide',slug:'one'},{title:'A Guide?',slug:'two'}]).includes('<a '));
});
test('HTML-like descriptions are displayed safely and unsafe source links are not preserved',()=>{
 const html=relatedReadingHtml(`<li>${articles[0].title}: &lt;img src=x onerror=alert(1)&gt; &amp; details.</li><li><a href="javascript:alert(1)">Unknown</a></li>`,articles);assert(!html.includes('<img'));assert(!html.includes('href="javascript:'));assert(html.includes('&lt;img'));assert(html.includes('&amp; details.'));
});
