import { AwsClient } from "aws4fetch";

export interface SignerConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
  service?: string;
}

/** Thin wrapper around aws4fetch for S3-compatible request signing. */
export class Signer {
  private client: AwsClient;

  constructor(config: SignerConfig) {
    this.client = new AwsClient({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region ?? "us-east-1",
      service: config.service ?? "s3",
    });
  }

  /** Sign and execute a fetch request. */
  async fetch(url: string, init?: RequestInit): Promise<Response> {
    const headers = new Headers(init?.headers);
    // Use UNSIGNED-PAYLOAD for browser convenience
    if (!headers.has("x-amz-content-sha256")) {
      headers.set("x-amz-content-sha256", "UNSIGNED-PAYLOAD");
    }
    return this.client.fetch(url, {
      ...init,
      headers,
    });
  }
}
