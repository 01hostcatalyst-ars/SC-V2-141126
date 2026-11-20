import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | undefined;

function storage() {
  const region = process.env.AWS_REGION;
  const bucket = process.env.S3_BUCKET_NAME;
  if (!region || !bucket) throw new Error("S3 storage is not configured");
  // The default credential provider supports environment keys today and IAM roles later.
  client ??= new S3Client({ region });
  return { client, bucket };
}

function validateKey(key: string) {
  if (!/^(agreements|certificates|cnic)\//.test(key) || key.split("/").some(part => !part || part === "." || part === "..") || /[\\\x00-\x1f]/.test(key)) {
    throw new Error("Invalid private storage path");
  }
}

export async function uploadPrivateFile(key: string, body: Uint8Array, contentType: string): Promise<string> {
  validateKey(key);
  const { client, bucket } = storage();
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: "private, no-store",
    ServerSideEncryption: "AES256",
  }));
  return key;
}

export async function privateFileExists(key: string): Promise<boolean> {
  validateKey(key);
  const { client, bucket } = storage();
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    // Access denied, network failures, and misconfiguration must not trigger overwrites.
    if ((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404) return false;
    throw error;
  }
}

export async function getPrivateDownloadUrl(key: string, expiresIn = 60): Promise<string> {
  validateKey(key);
  if (!Number.isInteger(expiresIn) || expiresIn < 1 || expiresIn > 300) throw new Error("Invalid download expiration");
  const { client, bucket } = storage();
  return getSignedUrl(client, new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseCacheControl: "private, no-store",
  }), { expiresIn });
}
