const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const resolve=Module._resolveFilename,load=Module._load;Module._resolveFilename=function(spec,...args){return resolve.call(this,spec.startsWith('@/')?path.join(process.cwd(),'src',spec.slice(2)):spec,...args);};require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
let blocked=false,databaseCalls=0,providerCalls=[],providerStatus=200,providerId=true;
Module._load=function(spec,...args){if(spec==='@/lib/prisma')return {prisma:{$transaction:async fn=>fn({$queryRaw:async()=>{databaseCalls++;return blocked?[]:[{used:1}];}})}};if(spec==='@/lib/config')return {getCompanyConfig:()=>({name:'SignCollab',domain:'www.example.test',supportEmail:'help@example.test'})};return load.call(this,spec,...args);};
process.env.RESEND_API_KEY='re_test_contact_key';delete process.env.CONTACT_TO_EMAIL;delete process.env.CONTACT_FROM_EMAIL;
global.fetch=async(url,options)=>{providerCalls.push({url,options,payload:JSON.parse(options.body)});return new Response(JSON.stringify(providerStatus===200?(providerId?{id:'email-accepted'}:{}):{name:'validation_error',message:'Provider rejected email'}),{status:providerStatus,headers:{'Content-Type':'application/json'}});};
const contact=require('../src/lib/contact.ts');const {POST}=require('../src/app/api/contact/route.ts');
const valid=()=>({name:'Test Visitor',email:'visitor@example.test',company:'Creator team',category:'general',subject:'A product question',message:'Hello, I need help with a creator profile.',website:'',requestId:'123e4567-e89b-42d3-a456-426614174000'});
const request=body=>new Request('https://www.signcollab.com/api/contact',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://www.signcollab.com'},body:JSON.stringify(body)});
test('valid messages use the configured recipient and visitor Reply-To, not a visitor-supplied destination',async()=>{
 providerCalls=[];const body=valid();body.to='attacker@example.test';const response=await POST(request(body));assert.equal(response.status,200);const data=await response.json();assert.equal(data.success,true);assert.equal(data.reference,'SC-123E4567');assert(!data.emailId);assert.equal(providerCalls.length,1);assert.deepEqual(providerCalls[0].payload.to,['help@example.test']);assert.equal(providerCalls[0].payload.reply_to,'visitor@example.test');assert.equal(providerCalls[0].payload.from,'SignCollab <support@example.test>');
});
test('all topics reach the same server-controlled inbox and retries use the same provider idempotency key',async()=>{
 providerCalls=[];for(const category of ['general','support','sales','security'])await contact.deliverContact(contact.validateContact({...valid(),category}));assert(providerCalls.every(call=>call.payload.to[0]==='help@example.test'));await contact.deliverContact(contact.validateContact({...valid(),category:'security'}));assert.equal(providerCalls[3].options.headers['Idempotency-Key'],providerCalls[4].options.headers['Idempotency-Key']);
});
test('invalid fields, header injection, oversized text and honeypots are rejected before email delivery',async()=>{
 providerCalls=[];const before=databaseCalls;for(const patch of [{name:''},{email:'invalid'},{email:'x@example.test\r\nBcc: y@example.test'},{subject:'Test\nInjected'},{category:'__proto__'},{message:'x'.repeat(5001)},{website:'https://spam.test'},{requestId:'not-an-id'},{name:{bad:true}}])assert.equal((await POST(request({...valid(),...patch}))).status,400);assert.equal(providerCalls.length,0);assert.equal(databaseCalls,before);
});
test('streamed body limits and invalid JSON fail without contacting the provider',async()=>{
 assert.equal((await POST(request({large:'x'.repeat(17000)}))).status,413);assert.equal((await POST(new Request('https://www.signcollab.com/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:'{bad'}))).status,400);
});
test('foreign origins, absent keys and quota failures prevent mail dispatch',async()=>{
 providerCalls=[];const foreign=request(valid());foreign.headers.set('Origin','https://evil.test');assert.equal((await POST(foreign)).status,403);blocked=true;assert.equal((await POST(request(valid()))).status,429);blocked=false;const key=process.env.RESEND_API_KEY;delete process.env.RESEND_API_KEY;assert.equal((await POST(request(valid()))).status,503);process.env.RESEND_API_KEY=key;assert.equal(providerCalls.length,0);
});
test('provider rejections or missing delivery IDs never return fake success',async()=>{
 providerStatus=422;assert.equal((await POST(request(valid()))).status,502);providerStatus=200;providerId=false;assert.equal((await POST(request(valid()))).status,502);providerId=true;
});
test('HTML in a message is displayed as escaped text in the email',async()=>{
 providerCalls=[];await contact.deliverContact(contact.validateContact({...valid(),message:'Example: <img src=x onerror=alert(1)> & test.'}));assert(!providerCalls[0].payload.html.includes('<img'));assert(providerCalls[0].payload.html.includes('&lt;img'));assert(providerCalls[0].payload.text.includes('<img'));
});
