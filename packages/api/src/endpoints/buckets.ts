import type { Signer } from "../signer";
import type { Bucket, BucketStats } from "../types";
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

/** GET /{bucket}?stats — bucket aggregate statistics. */
export async function getBucketStats(
  signer: Signer,
  endpoint: string,
  bucket: string,
): Promise<BucketStats> {
  const res = await signer.fetch(`${endpoint}/${bucket}?stats`);
  if (!res.ok) throw new Error(`GetBucketStats failed: ${res.status}`);
  const xml = await res.text();
  const parsed = parseXml<{
    BucketStatsResult?: {
      Name: string;
      TotalFiles: number;
      TotalSize: number;
      DuplicateFolders: number;
      DuplicateFiles: number;
      StorageReclaimable: number;
    };
  }>(xml);
  const r = parsed.BucketStatsResult;
  return {
    name: r?.Name ?? bucket,
    totalFiles: Number(r?.TotalFiles ?? 0),
    totalSize: Number(r?.TotalSize ?? 0),
    duplicateFolders: Number(r?.DuplicateFolders ?? 0),
    duplicateFiles: Number(r?.DuplicateFiles ?? 0),
    storageReclaimable: Number(r?.StorageReclaimable ?? 0),
  };
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
