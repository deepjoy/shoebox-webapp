import type { Signer } from "../signer";
import type { DeleteResult } from "../types";
import { buildXml, parseXml } from "../xml";

/** POST /{bucket}?delete — bulk delete objects. */
export async function deleteObjects(
  signer: Signer,
  endpoint: string,
  bucket: string,
  keys: string[],
): Promise<DeleteResult> {
  const body = buildXml({
    Delete: {
      Object: keys.map((key) => ({ Key: key })),
      Quiet: false,
    },
  });

  const res = await signer.fetch(`${endpoint}/${bucket}?delete`, {
    method: "POST",
    body,
    headers: { "content-type": "application/xml" },
  });
  if (!res.ok) throw new Error(`DeleteObjects failed: ${res.status}`);

  const xml = await res.text();
  const parsed = parseXml<{
    DeleteResult?: {
      Deleted?: { Key: string }[];
      Error?: { Key: string; Code: string; Message: string }[];
    };
  }>(xml);

  return {
    deleted: (parsed.DeleteResult?.Deleted ?? []).map((d) => ({ key: d.Key })),
    errors: (parsed.DeleteResult?.Error ?? []).map((e) => ({
      key: e.Key,
      code: e.Code,
      message: e.Message,
    })),
  };
}
