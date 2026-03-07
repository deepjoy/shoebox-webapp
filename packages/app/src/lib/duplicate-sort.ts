import type { DuplicateGroup } from "@shoebox/api";

/** Match quality: lower = better. */
const enum MatchRank {
  Exact = 0,
  Prefix = 1,
  Contains = 2,
  None = 3,
}

function fileMatchRank(fileKey: string, search: string): MatchRank {
  if (fileKey === search) return MatchRank.Exact;
  if (fileKey.startsWith(search)) return MatchRank.Prefix;
  if (fileKey.includes(search)) return MatchRank.Contains;
  return MatchRank.None;
}

function bestFileRank(group: DuplicateGroup, search: string): MatchRank {
  let best: MatchRank = MatchRank.None;
  for (const f of group.files) {
    const r = fileMatchRank(f.key, search);
    if (r < best) best = r;
    if (best === MatchRank.Exact) break;
  }
  return best;
}

/**
 * Sort duplicate groups so that groups with better key matches appear first.
 * Within each group, files are also sorted by match quality.
 *
 * Order: exact match → prefix match → contains match.
 */
export function sortDuplicatesByRelevance(
  groups: DuplicateGroup[],
  search: string,
): DuplicateGroup[] {
  if (!search) return groups;

  return groups
    .map((g) => ({
      ...g,
      files: [...g.files].sort(
        (a, b) => fileMatchRank(a.key, search) - fileMatchRank(b.key, search),
      ),
    }))
    .sort((a, b) => bestFileRank(a, search) - bestFileRank(b, search));
}
