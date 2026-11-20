import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { S3Client, GetObjectCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";

nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const apply = process.argv.includes("--apply");
const sourceBucket = "profiles";
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "AWS_REGION", "S3_BUCKET_NAME"];
for (const name of required) if (!process.env[name]) throw new Error(`Missing ${name}`);
const source = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
}).storage.from(sourceBucket);
const s3 = new S3Client({ region: process.env.AWS_REGION });
const Bucket = process.env.S3_BUCKET_NAME;

async function listFiles(prefix = "") {
  const files = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await source.list(prefix, { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(`Cannot list source storage (${error.statusCode || error.status || error.name}): ${error.message}`);
    for (const item of data || []) {
      if (item.name.includes("/") || item.name === "." || item.name === "..") throw new Error("Invalid source filename");
      const key = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null && item.metadata === null) files.push(...await listFiles(key));
      else files.push({ key, contentType: item.metadata?.mimetype });
    }
    if (!data || data.length < 100) break;
  }
  return files;
}

try {
  const files = await listFiles();
  console.log(JSON.stringify({ mode: apply ? "copy-and-verify" : "preview", sourceFiles: files.length,
    prefixes: Object.fromEntries([...new Set(files.map(f => f.key.split("/")[0]))].map(prefix => [prefix, files.filter(f => f.key.split("/")[0] === prefix).length])) }));
  if (!apply) {
    console.log("No files changed. Use --apply to copy without deleting source files or overwriting different destination files.");
  } else {
    let copied = 0;
    let alreadyIdentical = 0;
    let bytes = 0;
    for (const file of files) {
      const { data, error } = await source.download(file.key);
      if (error || !data) throw new Error("Source download failed; stopping migration");
      const body = Buffer.from(await data.arrayBuffer());
      const sha256 = digest(body);
      let exists = false;
      try {
        await s3.send(new HeadObjectCommand({ Bucket, Key: file.key }));
        exists = true;
      } catch (error) {
        if (error.$metadata?.httpStatusCode !== 404) throw error;
      }
      if (!exists) {
        await s3.send(new PutObjectCommand({ Bucket, Key: file.key, Body: body,
          ContentType: file.contentType || data.type || "application/octet-stream",
          CacheControl: "private, no-store", ServerSideEncryption: "AES256",
          Metadata: { sha256 }, IfNoneMatch: "*" }));
        copied++;
      }
      const downloaded = await s3.send(new GetObjectCommand({ Bucket, Key: file.key }));
      if (!downloaded.Body || digest(await downloaded.Body.transformToByteArray()) !== sha256) {
        throw new Error("Destination checksum differs from source; existing destination was not overwritten");
      }
      if (exists) alreadyIdentical++;
      bytes += body.length;
      console.log(JSON.stringify({ verified: copied + alreadyIdentical, total: files.length }));
    }
    console.log(JSON.stringify({ copied, alreadyIdentical, verified: copied + alreadyIdentical, bytes, sourceDeleted: 0 }));
  }
} catch (error) {
  // Do not log SDK request objects, signed URLs, tokens, or document contents.
  console.error("Storage migration failed:", error.name, error.$metadata?.httpStatusCode || "", error.message?.replace(/https?:\/\/\S+/g, "[URL omitted]"));
  process.exitCode = 1;
} finally {
  s3.destroy();
}
