import { Card, Group, Stack, Text, Loader, Center } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { Folder, HardDrive } from "lucide-react";
import { useAllDuplicateDirsForPrefix } from "../hooks/queries";
import { useConnectionId } from "../routes/$connectionId";
import { useBucket } from "../contexts/bucket";
import type { DuplicateDirGroup } from "@shoebox/api";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

function groupTotalSize(group: DuplicateDirGroup): number {
  return group.dirs.reduce((sum, d) => sum + d.total_size, 0);
}

export function DuplicateFoldersList({ onNavigate }: { onNavigate?: () => void }) {
  const connectionId = useConnectionId();
  const bucket = useBucket();
  const { data, isLoading } = useAllDuplicateDirsForPrefix(connectionId, bucket, "");

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  const groups = (data?.pages ?? []).flatMap((p) => p.duplicate_dirs);

  if (groups.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        No duplicate folders found.
      </Text>
    );
  }

  const MAX_GROUPS = 100;
  const sorted = [...groups].sort((a, b) => groupTotalSize(b) - groupTotalSize(a));
  const truncated = sorted.length > MAX_GROUPS;
  const visible = truncated ? sorted.slice(0, MAX_GROUPS) : sorted;

  return (
    <Stack gap="sm">
      {truncated && (
        <Text size="xs" c="dimmed">
          Showing the largest {MAX_GROUPS} of {groups.length} duplicate folder groups.
        </Text>
      )}
      {visible.map((group) => (
        <Card key={group.dir_hash} withBorder padding="sm">
          <Group gap={6} mb={4}>
            <HardDrive size={13} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              {formatBytes(group.dirs[0]?.total_size ?? 0)} each &middot;{" "}
              {group.dirs[0]?.file_count ?? 0} files
            </Text>
          </Group>
          <Stack gap={4}>
            {group.dirs.map((dir) => (
              <Link
                key={dir.prefix}
                to="/$connectionId/$bucket/$"
                params={{ connectionId, bucket, _splat: dir.prefix }}
                search={{ key: undefined }}
                onClick={onNavigate}
                style={{
                  textDecoration: "none",
                  color: "var(--mantine-color-anchor)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "var(--mantine-font-size-sm)",
                }}
              >
                <Folder size={14} />
                {dir.prefix}
              </Link>
            ))}
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
