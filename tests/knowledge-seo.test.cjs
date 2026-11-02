const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {extractKnowledgeSeo,knowledgeArticleMetadata}=require('../src/lib/knowledge-seo.ts');
const title='Are WhatsApp Messages and Instagram DMs Legally Binding?';
const description='Can a WhatsApp message or Instagram DM form a binding deal? Learn when chats count as a contract, what courts look for, and how to protect yourself.';
const article={title:'Document display title',excerpt:'Existing Drive excerpt',slug:'whatsapp-contracts',modifiedTime:'2026-11-01T10:00:00Z',createdTime:'2026-10-01T10:00:00Z'};
test('extracts the exact single-line shortcode supplied by the author',()=>{
 assert.deepEqual(extractKnowledgeSeo(`[seo-metadata] Meta Title: ${title} Meta Description: ${description} [/seo-metadata]`),{metaTitle:title,metaDescription:description});
});
test('handles Google Docs formatting, entities, multiline values and case-insensitive labels',()=>{
 const html='<p><span>[seo-metadata]</span></p><p><b>Meta Title:</b> Contracts &amp; creators: A guide</p><p><strong>Meta Description:</strong> Clear terms<br>for a creator&#39;s next deal.</p><p>[/seo-metadata]</p>';
 assert.deepEqual(extractKnowledgeSeo(html),{metaTitle:'Contracts & creators: A guide',metaDescription:"Clear terms for a creator's next deal."});
 assert.deepEqual(extractKnowledgeSeo('[SEO-METADATA] meta description: First. META TITLE: Second. [/SEO-METADATA]'),{metaDescription:'First.',metaTitle:'Second.'});
});
test('absent, empty and incomplete blocks do not replace working fallback values',()=>{
 for(const html of ['<p>Normal article</p>','[seo-metadata] Meta Title: Meta Description: [/seo-metadata]','[seo-metadata] Meta Title: Unclosed'])assert.deepEqual(extractKnowledgeSeo(html),{});
});
test('custom title and description drive SEO, Open Graph and Twitter without a layout title suffix',()=>{
 const fields=extractKnowledgeSeo(`[seo-metadata] Meta Title: ${title} Meta Description: ${description} [/seo-metadata]`);
 const metadata=knowledgeArticleMetadata({...article,...fields},'https://www.signcollab.com');
 assert.deepEqual(metadata.title,{absolute:title});assert.equal(metadata.description,description);assert.equal(metadata.openGraph.title,title);assert.equal(metadata.openGraph.description,description);assert.equal(metadata.twitter.title,title);assert.equal(metadata.twitter.description,description);
 assert.equal(metadata.alternates.canonical,'/knowledge/whatsapp-contracts');assert.equal(metadata.openGraph.modifiedTime,article.modifiedTime);assert.equal(article.title,'Document display title');
});
test('each missing custom field falls back independently to the previous article metadata',()=>{
 const defaults=knowledgeArticleMetadata(article,'https://www.signcollab.com');assert.equal(defaults.title,'Document display title — SignCollab Academy');assert.equal(defaults.description,article.excerpt);assert.equal(defaults.twitter.title,article.title);
 const onlyTitle=knowledgeArticleMetadata({...article,metaTitle:'Custom title'},'https://www.signcollab.com');assert.deepEqual(onlyTitle.title,{absolute:'Custom title'});assert.equal(onlyTitle.description,article.excerpt);
 const onlyDescription=knowledgeArticleMetadata({...article,metaDescription:'Custom description'},'https://www.signcollab.com');assert.equal(onlyDescription.title,defaults.title);assert.equal(onlyDescription.openGraph.description,'Custom description');
});
