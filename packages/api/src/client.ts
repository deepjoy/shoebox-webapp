import { Signer } from "./signer";
import type {
  Bucket,
  ListObjectsV2Options,
  ListObjectsV2Result,
  HeadObjectResult,
  DeleteResult,
  Tag,
  DuplicateReport,
  DuplicateDirReport,
  FindDuplicatesOptions,
  CrossBucketDuplicateReport,
  DirStatsReport,
  IntegrityCheckResult,
  CredentialInfo,
  BucketScanStatus,
} from "./types";
import * as buckets from "./endpoints/buckets";
import * as list from "./endpoints/list";
import * as objects from "./endpoints/objects";
import * as del from "./endpoints/delete";
import * as tagging from "./endpoints/tagging";
import * as sync from "./endpoints/sync";
import * as scan from "./endpoints/scan";
import * as duplicates from "./endpoints/duplicates";
import * as dirStatsEndpoint from "./endpoints/dir-stats";
import * as integrity from "./endpoints/integrity";
import * as credentials from "./endpoints/credentials";
import * as multipart from "./endpoints/multipart";

export interface ShoeboxClientConfig {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
}

/**
 * Typed S3-compatible client for Shoebox.
 *
 * All operations use AWS SigV4 signing via aws4fetch.
 */
export class ShoeboxClient {
  private signer: Signer;
  private endpoint: string;

  constructor(config: ShoeboxClientConfig) {
    this.endpoint = config.endpoint.replace(/\/$/, "");
    this.signer = new Signer({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region,
    });
  }

  // -- Bucket operations --

  listBuckets(): Promise<Bucket[]> {
    return buckets.listBuckets(this.signer, this.endpoint);
  }

  headBucket(bucket: string): Promise<boolean> {
    return buckets.headBucket(this.signer, this.endpoint, bucket);
  }

  // -- Object listing --

  listObjectsV2(bucket: string, opts?: ListObjectsV2Options): Promise<ListObjectsV2Result> {
    return list.listObjectsV2(this.signer, this.endpoint, bucket, opts);
  }

  // -- Object operations --

  getObject(bucket: string, key: string): Promise<Response> {
    return objects.getObject(this.signer, this.endpoint, bucket, key);
  }

  headObject(bucket: string, key: string): Promise<HeadObjectResult> {
    return objects.headObject(this.signer, this.endpoint, bucket, key);
  }

  putObject(
    bucket: string,
    key: string,
    body: BodyInit,
    contentType?: string,
  ): Promise<{ etag: string }> {
    return objects.putObject(this.signer, this.endpoint, bucket, key, body, contentType);
  }

  deleteObject(bucket: string, key: string): Promise<void> {
    return objects.deleteObject(this.signer, this.endpoint, bucket, key);
  }

  deleteObjects(bucket: string, keys: string[]): Promise<DeleteResult> {
    return del.deleteObjects(this.signer, this.endpoint, bucket, keys);
  }

  copyObject(bucket: string, sourceKey: string, destKey: string): Promise<void> {
    return objects.copyObject(this.signer, this.endpoint, bucket, sourceKey, destKey);
  }

  renameObject(bucket: string, sourceKey: string, destKey: string): Promise<void> {
    return objects.renameObject(this.signer, this.endpoint, bucket, sourceKey, destKey);
  }

  // -- Tagging --

  getObjectTagging(bucket: string, key: string): Promise<Tag[]> {
    return tagging.getObjectTagging(this.signer, this.endpoint, bucket, key);
  }

  putObjectTagging(bucket: string, key: string, tags: Tag[]): Promise<void> {
    return tagging.putObjectTagging(this.signer, this.endpoint, bucket, key, tags);
  }

  deleteObjectTagging(bucket: string, key: string): Promise<void> {
    return tagging.deleteObjectTagging(this.signer, this.endpoint, bucket, key);
  }

  // -- Sync --

  syncBucket(bucket: string): Promise<void> {
    return sync.syncBucket(this.signer, this.endpoint, bucket);
  }

  getScanStatus(): Promise<BucketScanStatus[]> {
    return scan.getScanStatus(this.signer, this.endpoint);
  }

  // -- Duplicates --

  findBucketDuplicates(bucket: string, options?: FindDuplicatesOptions): Promise<DuplicateReport> {
    return duplicates.findBucketDuplicates(this.signer, this.endpoint, bucket, options);
  }

  findBucketDuplicateDirs(
    bucket: string,
    options?: {
      minFiles?: number;
      maxResults?: number;
      prefix?: string;
      continuationToken?: string;
      maxDepth?: number;
    },
  ): Promise<DuplicateDirReport> {
    return duplicates.findBucketDuplicateDirs(this.signer, this.endpoint, bucket, options);
  }

  findCrossBucketDuplicates(maxResults?: number): Promise<CrossBucketDuplicateReport> {
    return duplicates.findCrossBucketDuplicates(this.signer, this.endpoint, maxResults);
  }

  // -- Directory Stats --

  getDirStats(bucket: string, prefix?: string): Promise<DirStatsReport> {
    return dirStatsEndpoint.getDirStats(this.signer, this.endpoint, bucket, prefix);
  }

  // -- Integrity --

  checkIntegrity(
    bucket: string,
    opts?: { scope?: string; async?: boolean },
  ): Promise<IntegrityCheckResult> {
    return integrity.checkIntegrity(this.signer, this.endpoint, bucket, opts);
  }

  getIntegrityStatus(bucket: string, checkId: string): Promise<IntegrityCheckResult> {
    return integrity.getIntegrityStatus(this.signer, this.endpoint, bucket, checkId);
  }

  // -- Credentials (admin) --

  listCredentials(): Promise<CredentialInfo[]> {
    return credentials.listCredentials(this.signer, this.endpoint);
  }

  createCredential(opts: {
    bucketName?: string;
    permissions?: string;
    description?: string;
  }): Promise<CredentialInfo> {
    return credentials.createCredential(this.signer, this.endpoint, opts);
  }

  deleteCredential(accessKeyId: string): Promise<void> {
    return credentials.deleteCredential(this.signer, this.endpoint, accessKeyId);
  }

  // -- Multipart --

  initiateMultipartUpload(bucket: string, key: string, contentType?: string): Promise<string> {
    return multipart.initiateMultipartUpload(this.signer, this.endpoint, bucket, key, contentType);
  }

  uploadPart(
    bucket: string,
    key: string,
    uploadId: string,
    partNumber: number,
    body: BodyInit,
  ): Promise<string> {
    return multipart.uploadPart(
      this.signer,
      this.endpoint,
      bucket,
      key,
      uploadId,
      partNumber,
      body,
    );
  }

  completeMultipartUpload(
    bucket: string,
    key: string,
    uploadId: string,
    parts: { partNumber: number; etag: string }[],
  ): Promise<void> {
    return multipart.completeMultipartUpload(
      this.signer,
      this.endpoint,
      bucket,
      key,
      uploadId,
      parts,
    );
  }

  abortMultipartUpload(bucket: string, key: string, uploadId: string): Promise<void> {
    return multipart.abortMultipartUpload(this.signer, this.endpoint, bucket, key, uploadId);
  }
}
