import type { Signer } from "../signer";

/** POST /{bucket}?sync — trigger sync for a bucket. */
export async function syncBucket(signer: Signer, endpoint: string, bucket: string): Promise<void> {
  const res = await signer.fetch(`${endpoint}/${bucket}?sync`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Sync failed: ${res.status}`);
}
