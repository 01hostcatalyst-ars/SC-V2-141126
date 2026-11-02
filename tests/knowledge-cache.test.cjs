const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),Module=require('node:module'),ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const cacheEntries=new Map(),policies=[];let exportCount=0,failExport=true;
process.env.GOOGLE_DRIVE_FOLDER_ID='test-folder';process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL='test@example.invalid';process.env.GOOGLE_PRIVATE_KEY='test-only';
const originalLoad=Module._load;
Module._load=function(spec,...args){
 if(spec==='react')return {cache:fn=>fn};
 if(spec==='next/cache')return {unstable_cache:(fn,keys,options)=>{policies.push({keys,options});return async(...args)=>{const key=JSON.stringify([keys,args]);if(cacheEntries.has(key))return cacheEntries.get(key);const result=await fn(...args);cacheEntries.set(key,result);return result;};}};
 if(spec==='googleapis')return {google:{auth:{JWT:class{}},drive:()=>({files:{list:async()=>({data:{files:[{id:'doc-1',name:'Cache Test',description:'A published guide',modifiedTime:'2026-11-02T10:00:00Z'}]}}),export:async()=>{exportCount++;if(failExport)throw new Error('Temporary Google failure');return {data:'<h1>Cache Test</h1><p>Published article content.</p>'};}}})}};
 return originalLoad.call(this,spec,...args);
};
const {getArticleBySlug}=require('../src/lib/gdocs.ts');
test('a failed export can recover immediately, then successful repeat visits reuse the cached article',async()=>{
 assert.equal(await getArticleBySlug('cache-test'),null);assert.equal(exportCount,1);failExport=false;
 const article=await getArticleBySlug('cache-test');assert(article);assert.equal(article.title,'Cache Test');assert.equal(exportCount,2);
 assert.equal(await getArticleBySlug('cache-test'),article);assert.equal(exportCount,2);
 const policy=policies.find(item=>item.keys[0]==='knowledge-article-30days-v1');assert.equal(policy.options.revalidate,2592000);
});
test('missing article lookups do not become long-lived null entries',async()=>{
 const before=cacheEntries.size;assert.equal(await getArticleBySlug('not-published'),null);assert.equal(await getArticleBySlug('not-published'),null);assert.equal(cacheEntries.size,before);
});
