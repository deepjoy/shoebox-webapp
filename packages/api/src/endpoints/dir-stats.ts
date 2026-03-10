import type { Signer } from "../signer";
import type { DirStatsReport, DirStats } from "../types";
import { parseXml } from "../xml";

interface DirStatsXml {
  Prefix: string;
  FileCount: number;
  TotalSize: number;
}

interface DirStatsReportXml {
  Bucket: string;
  Prefix: string;
  DirStats?: DirStatsXml[];
}

/** GET /{bucket}?dir-stats — get size/file-count for direct child directories. */
export async function getDirStats(
  signer: Signer,
  endpoint: string,
  bucket: string,
  prefix?: string,
): Promise<DirStatsReport> {
  const params = new URLSearchParams({ "dir-stats": "" });
  if (prefix != null) params.set("prefix", prefix);

  const res = await signer.fetch(`${endpoint}/${bucket}?${params}`);
  if (!res.ok) throw new Error(`GetDirStats failed: ${res.status}`);
  const xml = await res.text();
  const r = parseXml<{ DirStatsReport: DirStatsReportXml }>(xml).DirStatsReport;

  return {
    bucket: r.Bucket ?? bucket,
    prefix: r.Prefix ?? "",
    dirs: (r.DirStats ?? []).map(
      (d): DirStats => ({
        prefix: d.Prefix,
        file_count: Number(d.FileCount),
        total_size: Number(d.TotalSize),
      }),
    ),
  };
}
