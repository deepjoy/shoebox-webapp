import type { Signer } from "../signer";
import type { ListObjectsV2Options, ListObjectsV2Result, ObjectInfo } from "../types";
import { parseXml } from "../xml";

/** GET /{bucket}?list-type=2 — ListObjectsV2. */
export async function listObjectsV2(
  signer: Signer,
  endpoint: string,
  bucket: string,
  opts?: ListObjectsV2Options,
): Promise<ListObjectsV2Result> {
  const params = new URLSearchParams({ "list-type": "2" });
  if (opts?.prefix) params.set("prefix", opts.prefix);
  if (opts?.delimiter) params.set("delimiter", opts.delimiter);
  if (opts?.maxKeys) params.set("max-keys", String(opts.maxKeys));
  if (opts?.continuationToken) params.set("continuation-token", opts.continuationToken);
  if (opts?.startAfter) params.set("start-after", opts.startAfter);

  const res = await signer.fetch(`${endpoint}/${bucket}?${params}`);
  if (!res.ok) throw new Error(`ListObjectsV2 failed: ${res.status}`);
  const xml = await res.text();
  const parsed = parseXml<{
    ListBucketResult?: {
      Name?: string;
      Prefix?: string;
      Delimiter?: string;
      MaxKeys?: number;
      IsTruncated?: boolean;
      NextContinuationToken?: string;
      Contents?: {
        Key: string;
        LastModified: string;
        ETag: string;
        Size: number;
        StorageClass?: string;
      }[];
      CommonPrefixes?: { Prefix: string }[];
    };
  }>(xml);

  const r = parsed.ListBucketResult;
  const contents: ObjectInfo[] = (r?.Contents ?? []).map((c) => ({
    key: c.Key,
    lastModified: c.LastModified,
    etag: c.ETag,
    size: Number(c.Size),
    storageClass: c.StorageClass ?? "STANDARD",
  }));

  const commonPrefixes = (r?.CommonPrefixes ?? []).map((p) => p.Prefix);

  return {
    name: r?.Name ?? bucket,
    prefix: r?.Prefix,
    delimiter: r?.Delimiter,
    maxKeys: Number(r?.MaxKeys ?? 1000),
    isTruncated: r?.IsTruncated === true,
    nextContinuationToken: r?.NextContinuationToken,
    contents,
    commonPrefixes,
  };
}
