import "server-only";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// R2 is S3-compatible, so the AWS SDK works against it unmodified — only the
// endpoint (Cloudflare's account-scoped URL) and region ("auto") differ from
// real S3. Media storage per SRS.md FR-10.
function getClient() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string> {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  const base = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
  return `${base}/${key}`;
}
