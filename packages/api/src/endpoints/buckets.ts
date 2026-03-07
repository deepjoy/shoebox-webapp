import type { Signer } from "../signer";
import type { Bucket } from "../types";
import { parseXml } from "../xml";

/** GET / — list all buckets. */
export async function listBuckets(signer: Signer, endpoint: string): Promise<Bucket[]> {
  const res = await signer.fetch(`${endpoint}/`);
  if (!res.ok) throw new Error(`ListBuckets failed: ${res.status}`);
  const xml = await res.text();
  const parsed = parseXml<{
    ListAllMyBucketsResult?: { Buckets?: { Bucket?: { Name: string; CreationDate: string }[] } };
  }>(xml);
  const buckets = parsed.ListAllMyBucketsResult?.Buckets?.Bucket ?? [];
  return buckets.map((b) => ({
    name: b.Name,
    creationDate: b.CreationDate,
  }));
}

/** HEAD /{bucket} — check bucket exists. */
export async function headBucket(
  signer: Signer,
  endpoint: string,
  bucket: string,
): Promise<boolean> {
  const res = await signer.fetch(`${endpoint}/${bucket}`, { method: "HEAD" });
  return res.ok;
}
