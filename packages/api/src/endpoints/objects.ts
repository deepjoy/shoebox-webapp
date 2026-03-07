import type { Signer } from "../signer";
import type { HeadObjectResult } from "../types";

/** GET /{bucket}/{key} — download an object. Returns raw Response. */
export async function getObject(
  signer: Signer,
  endpoint: string,
  bucket: string,
  key: string,
): Promise<Response> {
  const res = await signer.fetch(`${endpoint}/${bucket}/${key}`);
  if (!res.ok) throw new Error(`GetObject failed: ${res.status}`);
  return res;
}

/** HEAD /{bucket}/{key} — get object metadata. */
export async function headObject(
  signer: Signer,
  endpoint: string,
  bucket: string,
  key: string,
): Promise<HeadObjectResult> {
  const res = await signer.fetch(`${endpoint}/${bucket}/${key}`, {
    method: "HEAD",
  });
  if (!res.ok) throw new Error(`HeadObject failed: ${res.status}`);

  const metadata: Record<string, string> = {};
  res.headers.forEach((value, name) => {
    if (name.startsWith("x-amz-meta-")) {
      metadata[name.slice("x-amz-meta-".length)] = value;
    }
  });

  return {
    contentType: res.headers.get("content-type") ?? "application/octet-stream",
    contentLength: Number(res.headers.get("content-length") ?? 0),
    etag: res.headers.get("etag") ?? "",
    lastModified: res.headers.get("last-modified") ?? "",
    metadata,
    checksumSha256: res.headers.get("x-amz-checksum-sha256") ?? undefined,
    checksumSha1: res.headers.get("x-amz-checksum-sha1") ?? undefined,
    checksumCrc32: res.headers.get("x-amz-checksum-crc32") ?? undefined,
    checksumCrc32c: res.headers.get("x-amz-checksum-crc32c") ?? undefined,
  };
}

/** PUT /{bucket}/{key} — upload an object. */
export async function putObject(
  signer: Signer,
  endpoint: string,
  bucket: string,
  key: string,
  body: BodyInit,
  contentType?: string,
): Promise<{ etag: string }> {
  const headers: Record<string, string> = {};
  if (contentType) headers["content-type"] = contentType;
  const res = await signer.fetch(`${endpoint}/${bucket}/${key}`, {
    method: "PUT",
    body,
    headers,
  });
  if (!res.ok) throw new Error(`PutObject failed: ${res.status}`);
  return { etag: res.headers.get("etag") ?? "" };
}

/** DELETE /{bucket}/{key} — delete an object. */
export async function deleteObject(
  signer: Signer,
  endpoint: string,
  bucket: string,
  key: string,
): Promise<void> {
  const res = await signer.fetch(`${endpoint}/${bucket}/${key}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`DeleteObject failed: ${res.status}`);
}

/** PUT /{bucket}/{key} with x-amz-copy-source — copy an object. */
export async function copyObject(
  signer: Signer,
  endpoint: string,
  bucket: string,
  sourceKey: string,
  destKey: string,
): Promise<void> {
  const res = await signer.fetch(`${endpoint}/${bucket}/${destKey}`, {
    method: "PUT",
    headers: {
      "x-amz-copy-source": `/${bucket}/${sourceKey}`,
    },
  });
  if (!res.ok) throw new Error(`CopyObject failed: ${res.status}`);
}

/** PUT /{bucket}/{destKey} with x-shoebox-rename — rename an object. */
export async function renameObject(
  signer: Signer,
  endpoint: string,
  bucket: string,
  sourceKey: string,
  destKey: string,
): Promise<void> {
  const res = await signer.fetch(`${endpoint}/${bucket}/${destKey}`, {
    method: "PUT",
    headers: {
      "x-amz-copy-source": `/${bucket}/${sourceKey}`,
      "x-shoebox-rename": "true",
    },
  });
  if (!res.ok) throw new Error(`RenameObject failed: ${res.status}`);
}
