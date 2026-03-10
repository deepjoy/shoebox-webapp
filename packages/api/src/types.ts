/** S3 connection configuration (stored in localStorage). */
export interface ShoeboxConnection {
  id: string;
  name: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
}

/** Bucket info from ListBuckets. */
export interface Bucket {
  name: string;
  creationDate: string;
}

/** Options for ListObjectsV2. */
export interface ListObjectsV2Options {
  prefix?: string;
  delimiter?: string;
  maxKeys?: number;
  continuationToken?: string;
  startAfter?: string;
}

/** ListObjectsV2 result. */
export interface ListObjectsV2Result {
  name: string;
  prefix?: string;
  delimiter?: string;
  maxKeys: number;
  isTruncated: boolean;
  nextContinuationToken?: string;
  contents: ObjectInfo[];
  commonPrefixes: string[];
}

/** Object metadata from listing. */
export interface ObjectInfo {
  key: string;
  lastModified: string;
  etag: string;
  size: number;
  storageClass: string;
}

/** HeadObject result. */
export interface HeadObjectResult {
  contentType: string;
  contentLength: number;
  etag: string;
  lastModified: string;
  metadata: Record<string, string>;
  checksumSha256?: string;
  checksumSha1?: string;
  checksumCrc32?: string;
  checksumCrc32c?: string;
}

/** Result of a bulk delete operation. */
export interface DeleteResult {
  deleted: { key: string }[];
  errors: { key: string; code: string; message: string }[];
}

/** CORS rule for a bucket. */
export interface CorsRule {
  allowed_origins: string[];
  allowed_methods: string[];
  allowed_headers: string[];
  expose_headers?: string[];
  max_age_seconds?: number;
}

/** Tag key-value pair. */
export interface Tag {
  key: string;
  value: string;
}

/** Duplicate file info. */
export interface DuplicateFile {
  object_id: string;
  key: string;
  bucket?: string;
}

/** A group of duplicate files. */
export interface DuplicateGroup {
  checksum_sha256: string;
  size: number;
  files: DuplicateFile[];
}

/** Options for FindBucketDuplicates. */
export interface FindDuplicatesOptions {
  maxResults?: number;
  allowPartial?: boolean;
  continuationToken?: string;
  keyContains?: string;
  maxDepth?: number;
}

/** Single-bucket duplicate report. */
export interface DuplicateReport {
  bucket: string;
  scan_complete: boolean;
  is_truncated: boolean;
  next_continuation_token?: string;
  duplicates: DuplicateGroup[];
}

/** A directory that is a duplicate of another. */
export interface DuplicateDir {
  prefix: string;
  file_count: number;
  total_size: number;
}

/** A group of duplicate directories sharing the same content hash. */
export interface DuplicateDirGroup {
  dir_hash: string;
  dirs: DuplicateDir[];
}

/** Duplicate-directory report for a single bucket. */
export interface DuplicateDirReport {
  bucket: string;
  is_truncated: boolean;
  next_continuation_token?: string;
  duplicate_dirs: DuplicateDirGroup[];
}

/** Stats for a single directory (from ?dir-stats). */
export interface DirStats {
  prefix: string;
  file_count: number;
  total_size: number;
}

/** Dir-stats report for child directories under a prefix. */
export interface DirStatsReport {
  bucket: string;
  prefix: string;
  dirs: DirStats[];
}

/** Cross-bucket duplicate report. */
export interface CrossBucketDuplicateReport {
  is_truncated: boolean;
  duplicates: DuplicateGroup[];
}

/** Integrity check result. */
export interface IntegrityCheckResult {
  check_id: string;
  status: string;
  files_checked: number;
  bytes_checked: number;
  files_ok: number;
  discrepancies: IntegrityDiscrepancy[];
}

/** Single integrity discrepancy. */
export interface IntegrityDiscrepancy {
  key: string;
  object_id: string;
  reason: string;
  stored_hash?: string;
  computed_hash?: string;
  mtime_changed?: boolean;
}

/** Bucket-level aggregate statistics (from ?stats). */
export interface BucketStats {
  name: string;
  totalFiles: number;
  totalSize: number;
  duplicateFolders: number;
  duplicateFiles: number;
  storageReclaimable: number;
}

/** Scan status for a single bucket (PascalCase matches XML element names). */
export interface BucketScanStatus {
  Name: string;
  RunningCount: number;
  PendingCount: number;
  PausedCount: number;
  IsPaused: boolean;
}

/** Credential info (secret redacted in list responses). */
export interface CredentialInfo {
  access_key_id: string;
  secret_access_key?: string;
  bucket_name?: string;
  permissions: string[];
  description?: string;
}
