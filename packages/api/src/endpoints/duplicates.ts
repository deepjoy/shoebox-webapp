import type { Signer } from "../signer";
import type {
  DuplicateReport,
  DuplicateGroup,
  DuplicateFile,
  CrossBucketDuplicateReport,
  DuplicateDirReport,
  DuplicateDirGroup,
  DuplicateDir,
  FindDuplicatesOptions,
} from "../types";
import { parseXml } from "../xml";

// ── XML shape types (PascalCase from server) ────────────────────────

interface DuplicateFileXml {
  ObjectId: string;
  Key: string;
  Bucket?: string;
}

interface DuplicateGroupXml {
  ContentHash: string;
  Size: number;
  File: DuplicateFileXml[];
}

interface DuplicateReportXml {
  Bucket: string;
  ScanComplete: boolean;
  IsTruncated: boolean;
  NextContinuationToken?: string;
  DuplicateGroup: DuplicateGroupXml[];
}

interface CrossBucketDuplicateReportXml {
  IsTruncated: boolean;
  DuplicateGroup: DuplicateGroupXml[];
}

interface DuplicateDirXml {
  Prefix: string;
  FileCount: number;
  TotalSize: number;
}

interface DuplicateDirGroupXml {
  DirHash: string;
  Directory: DuplicateDirXml[];
}

interface DuplicateDirReportXml {
  Bucket: string;
  IsTruncated: boolean;
  NextContinuationToken?: string;
  DuplicateDirGroup: DuplicateDirGroupXml[];
}

// ── Mapping helpers ─────────────────────────────────────────────────

function mapFile(f: DuplicateFileXml): DuplicateFile {
  return {
    object_id: f.ObjectId,
    key: f.Key,
    bucket: f.Bucket,
  };
}

function mapGroup(g: DuplicateGroupXml): DuplicateGroup {
  return {
    checksum_sha256: g.ContentHash,
    size: Number(g.Size),
    files: (g.File ?? []).map(mapFile),
  };
}

/** GET /{bucket}?duplicates — find duplicates in a bucket. */
export async function findBucketDuplicates(
  signer: Signer,
  endpoint: string,
  bucket: string,
  options: FindDuplicatesOptions = {},
): Promise<DuplicateReport> {
  const params = new URLSearchParams({ duplicates: "" });
  if (options.maxResults != null) params.set("max-results", String(options.maxResults));
  if (options.allowPartial) params.set("allow-partial", "true");
  if (options.continuationToken) params.set("continuation-token", options.continuationToken);
  if (options.keyContains) params.set("key-contains", options.keyContains);
  if (options.maxDepth != null) params.set("max-depth", String(options.maxDepth));

  const res = await signer.fetch(`${endpoint}/${bucket}?${params}`);
  if (!res.ok) throw new Error(`FindBucketDuplicates failed: ${res.status}`);
  const xml = await res.text();
  const r = parseXml<{ DuplicateReport: DuplicateReportXml }>(xml).DuplicateReport;

  return {
    bucket: r.Bucket ?? bucket,
    scan_complete: r.ScanComplete === true,
    is_truncated: r.IsTruncated === true,
    next_continuation_token: r.NextContinuationToken,
    duplicates: (r.DuplicateGroup ?? []).map(mapGroup),
  };
}

/** GET /{bucket}?duplicate-dirs — find duplicate directories in a bucket. */
export async function findBucketDuplicateDirs(
  signer: Signer,
  endpoint: string,
  bucket: string,
  options: {
    minFiles?: number;
    maxResults?: number;
    prefix?: string;
    continuationToken?: string;
    maxDepth?: number;
  } = {},
): Promise<DuplicateDirReport> {
  const params = new URLSearchParams({ "duplicate-dirs": "" });
  if (options.minFiles != null) params.set("min-files", String(options.minFiles));
  if (options.maxResults != null) params.set("max-results", String(options.maxResults));
  if (options.prefix) params.set("prefix", options.prefix);
  if (options.continuationToken) params.set("continuation-token", options.continuationToken);
  if (options.maxDepth != null) params.set("max-depth", String(options.maxDepth));

  const res = await signer.fetch(`${endpoint}/${bucket}?${params}`);
  if (!res.ok) throw new Error(`FindBucketDuplicateDirs failed: ${res.status}`);
  const xml = await res.text();
  const r = parseXml<{ DuplicateDirReport: DuplicateDirReportXml }>(xml).DuplicateDirReport;

  return {
    bucket: r.Bucket ?? bucket,
    is_truncated: r.IsTruncated === true,
    next_continuation_token: r.NextContinuationToken,
    duplicate_dirs: (r.DuplicateDirGroup ?? []).map(
      (g): DuplicateDirGroup => ({
        dir_hash: g.DirHash,
        dirs: (g.Directory ?? []).map(
          (d): DuplicateDir => ({
            prefix: d.Prefix,
            file_count: Number(d.FileCount),
            total_size: Number(d.TotalSize),
          }),
        ),
      }),
    ),
  };
}

/** GET /?duplicates — find duplicates across all buckets. */
export async function findCrossBucketDuplicates(
  signer: Signer,
  endpoint: string,
  maxResults = 100,
): Promise<CrossBucketDuplicateReport> {
  const params = new URLSearchParams({
    duplicates: "",
    "max-results": String(maxResults),
  });
  const res = await signer.fetch(`${endpoint}/?${params}`);
  if (!res.ok) throw new Error(`FindCrossBucketDuplicates failed: ${res.status}`);
  const xml = await res.text();
  const r = parseXml<{
    CrossBucketDuplicateReport: CrossBucketDuplicateReportXml;
  }>(xml).CrossBucketDuplicateReport;

  return {
    is_truncated: r.IsTruncated === true,
    duplicates: (r.DuplicateGroup ?? []).map(mapGroup),
  };
}
