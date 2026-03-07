import type { Signer } from "../signer";
import type { BucketScanStatus } from "../types";
import { parseXml } from "../xml";

/** GET /_shoebox/scan/status — get scan status for all buckets. */
export async function getScanStatus(signer: Signer, endpoint: string): Promise<BucketScanStatus[]> {
  const res = await signer.fetch(`${endpoint}/_shoebox/scan/status`);
  if (!res.ok) throw new Error(`GetScanStatus failed: ${res.status}`);
  const xml = await res.text();
  const parsed = parseXml<{
    ScanStatus: { Bucket?: BucketScanStatus[] };
  }>(xml);
  return parsed.ScanStatus?.Bucket ?? [];
}
