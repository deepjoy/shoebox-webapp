import type { Signer } from "../signer";
import { buildXml, parseXml } from "../xml";

/** POST /{bucket}/{key}?uploads — initiate multipart upload. */
export async function initiateMultipartUpload(
  signer: Signer,
  endpoint: string,
  bucket: string,
  key: string,
  contentType?: string,
): Promise<string> {
  const headers: Record<string, string> = {};
  if (contentType) headers["content-type"] = contentType;
  const res = await signer.fetch(`${endpoint}/${bucket}/${key}?uploads`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error(`InitiateMultipartUpload failed: ${res.status}`);
  const xml = await res.text();
  const parsed = parseXml<{
    InitiateMultipartUploadResult?: { UploadId: string };
  }>(xml);
  return parsed.InitiateMultipartUploadResult?.UploadId ?? "";
}

/** PUT /{bucket}/{key}?partNumber=N&uploadId=X — upload a part. */
export async function uploadPart(
  signer: Signer,
  endpoint: string,
  bucket: string,
  key: string,
  uploadId: string,
  partNumber: number,
  body: BodyInit,
): Promise<string> {
  const params = new URLSearchParams({
    partNumber: String(partNumber),
    uploadId,
  });
  const res = await signer.fetch(`${endpoint}/${bucket}/${key}?${params}`, {
    method: "PUT",
    body,
  });
  if (!res.ok) throw new Error(`UploadPart failed: ${res.status}`);
  return res.headers.get("etag") ?? "";
}

/** POST /{bucket}/{key}?uploadId=X — complete multipart upload. */
export async function completeMultipartUpload(
  signer: Signer,
  endpoint: string,
  bucket: string,
  key: string,
  uploadId: string,
  parts: { partNumber: number; etag: string }[],
): Promise<void> {
  const body = buildXml({
    CompleteMultipartUploadRequest: {
      Part: parts.map((p) => ({
        PartNumber: p.partNumber,
        ETag: p.etag,
      })),
    },
  });
  const res = await signer.fetch(`${endpoint}/${bucket}/${key}?uploadId=${uploadId}`, {
    method: "POST",
    body,
    headers: { "content-type": "application/xml" },
  });
  if (!res.ok) throw new Error(`CompleteMultipartUpload failed: ${res.status}`);
}

/** DELETE /{bucket}/{key}?uploadId=X — abort multipart upload. */
export async function abortMultipartUpload(
  signer: Signer,
  endpoint: string,
  bucket: string,
  key: string,
  uploadId: string,
): Promise<void> {
  const res = await signer.fetch(`${endpoint}/${bucket}/${key}?uploadId=${uploadId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`AbortMultipartUpload failed: ${res.status}`);
}
