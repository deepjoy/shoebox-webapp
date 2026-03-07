import type { Signer } from "../signer";
import type { CredentialInfo } from "../types";
import { parseXml } from "../xml";

/** GET /_shoebox/credentials — list all credentials. */
export async function listCredentials(signer: Signer, endpoint: string): Promise<CredentialInfo[]> {
  const res = await signer.fetch(`${endpoint}/_shoebox/credentials`);
  if (!res.ok) throw new Error(`ListCredentials failed: ${res.status}`);
  const xml = await res.text();
  const parsed = parseXml<Record<string, unknown>>(xml);
  // Response format varies; return raw parsed for now
  return parsed as unknown as CredentialInfo[];
}

/** POST /_shoebox/credentials — create a credential. */
export async function createCredential(
  signer: Signer,
  endpoint: string,
  opts: {
    bucketName?: string;
    permissions?: string;
    description?: string;
  },
): Promise<CredentialInfo> {
  const xml = `<CreateCredentialRequest>
    ${opts.bucketName ? `<BucketName>${opts.bucketName}</BucketName>` : ""}
    ${opts.permissions ? `<Permissions>${opts.permissions}</Permissions>` : ""}
    ${opts.description ? `<Description>${opts.description}</Description>` : ""}
  </CreateCredentialRequest>`;

  const res = await signer.fetch(`${endpoint}/_shoebox/credentials`, {
    method: "POST",
    body: xml,
    headers: { "content-type": "application/xml" },
  });
  if (!res.ok) throw new Error(`CreateCredential failed: ${res.status}`);
  const responseXml = await res.text();
  return parseXml(responseXml) as unknown as CredentialInfo;
}

/** DELETE /_shoebox/credentials/{accessKeyId} — delete a credential. */
export async function deleteCredential(
  signer: Signer,
  endpoint: string,
  accessKeyId: string,
): Promise<void> {
  const res = await signer.fetch(`${endpoint}/_shoebox/credentials/${accessKeyId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`DeleteCredential failed: ${res.status}`);
}
