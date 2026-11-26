import { env } from "@/lib/env";

export function r2Configured(): boolean {
  return Boolean(
    env.STORAGE_ENDPOINT &&
      env.STORAGE_BUCKET &&
      env.STORAGE_ACCESS_KEY_ID &&
      env.STORAGE_SECRET_ACCESS_KEY,
  );
}

async function client() {
  const { S3Client } = await import("@aws-sdk/client-s3");
  return new S3Client({
    region: env.STORAGE_REGION || "auto",
    endpoint: env.STORAGE_ENDPOINT,
    credentials: {
      accessKeyId: env.STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY!,
    },
  });
}

export async function putR2Object(input: {
  objectKey: string;
  body: Buffer;
  mime: string;
}): Promise<void> {
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const s3 = await client();
  await s3.send(
    new PutObjectCommand({
      Bucket: env.STORAGE_BUCKET,
      Key: input.objectKey,
      Body: input.body,
      ContentType: input.mime,
    }),
  );
}

export async function deleteR2Object(objectKey: string): Promise<void> {
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  const s3 = await client();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.STORAGE_BUCKET,
      Key: objectKey,
    }),
  );
}
