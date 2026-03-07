import type { Signer } from "../signer";
import type { Tag } from "../types";
import { buildXml, parseXml } from "../xml";

/** GET /{bucket}/{key}?tagging — get object tags. */
export async function getObjectTagging(
  signer: Signer,
  endpoint: string,
  bucket: string,
  key: string,
): Promise<Tag[]> {
  const res = await signer.fetch(`${endpoint}/${bucket}/${key}?tagging`);
  if (!res.ok) throw new Error(`GetObjectTagging failed: ${res.status}`);
  const xml = await res.text();
  const parsed = parseXml<{
    Tagging?: { TagSet?: { Tag?: { Key: string; Value: string }[] } };
  }>(xml);
  return (parsed.Tagging?.TagSet?.Tag ?? []).map((t) => ({
    key: t.Key,
    value: t.Value,
  }));
}

/** PUT /{bucket}/{key}?tagging — set object tags. */
export async function putObjectTagging(
  signer: Signer,
  endpoint: string,
  bucket: string,
  key: string,
  tags: Tag[],
): Promise<void> {
  const body = buildXml({
    Tagging: {
      TagSet: {
        Tag: tags.map((t) => ({ Key: t.key, Value: t.value })),
      },
    },
  });
  const res = await signer.fetch(`${endpoint}/${bucket}/${key}?tagging`, {
    method: "PUT",
    body,
    headers: { "content-type": "application/xml" },
  });
  if (!res.ok) throw new Error(`PutObjectTagging failed: ${res.status}`);
}

/** DELETE /{bucket}/{key}?tagging — delete object tags. */
export async function deleteObjectTagging(
  signer: Signer,
  endpoint: string,
  bucket: string,
  key: string,
): Promise<void> {
  const res = await signer.fetch(`${endpoint}/${bucket}/${key}?tagging`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`DeleteObjectTagging failed: ${res.status}`);
}
