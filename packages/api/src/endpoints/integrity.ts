import type { Signer } from "../signer";
import type { IntegrityCheckResult } from "../types";
import { parseXml } from "../xml";

/** GET /{bucket}?integrity-check — run integrity check. */
export async function checkIntegrity(
  signer: Signer,
  endpoint: string,
  bucket: string,
  opts?: { scope?: string; async?: boolean },
): Promise<IntegrityCheckResult> {
  const params = new URLSearchParams({ "integrity-check": "" });
  if (opts?.scope) params.set("scope", opts.scope);
  if (opts?.async) params.set("async", "true");

  const res = await signer.fetch(`${endpoint}/${bucket}?${params}`);
  if (!res.ok) throw new Error(`IntegrityCheck failed: ${res.status}`);
  const xml = await res.text();
  return parseXml<{ IntegrityCheckResult: IntegrityCheckResult }>(xml).IntegrityCheckResult;
}

/** GET /{bucket}?integrity-status&check_id=X — poll async check status. */
export async function getIntegrityStatus(
  signer: Signer,
  endpoint: string,
  bucket: string,
  checkId: string,
): Promise<IntegrityCheckResult> {
  const params = new URLSearchParams({
    "integrity-status": "",
    check_id: checkId,
  });
  const res = await signer.fetch(`${endpoint}/${bucket}?${params}`);
  if (!res.ok) throw new Error(`IntegrityStatus failed: ${res.status}`);
  const xml = await res.text();
  return parseXml<{ IntegrityCheckResult: IntegrityCheckResult }>(xml).IntegrityCheckResult;
}
