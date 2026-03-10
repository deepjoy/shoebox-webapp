import {
  ActionIcon,
  Badge,
  Card,
  Group,
  SimpleGrid,
  Skeleton,
  Text,
  Title,
  Stack,
  Tooltip,
  Divider,
  ThemeIcon,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { Database, RefreshCw, Files, HardDrive, Copy, FolderSync, Recycle } from "lucide-react";
import { useBuckets, useBucketStats, useScanStatus, useSyncBucket } from "../hooks/queries";
import { useConnectionId } from "../routes/$connectionId";
import type { BucketScanStatus } from "@shoebox/api";

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Returns true if a creation date is valid (not epoch-zero or missing). */
function isValidDate(dateStr: string): boolean {
  const d = new Date(dateStr);
  return !Number.isNaN(d.getTime()) && d.getTime() > 0;
}

export function BucketList() {
  const connectionId = useConnectionId();
  const { data: buckets } = useBuckets(connectionId);
  const { data: scanStatuses, dataUpdatedAt, refetch, isFetching } = useScanStatus(connectionId);

  const statusByName = new Map<string, BucketScanStatus>();
  if (scanStatuses) {
    for (const s of scanStatuses) {
      statusByName.set(s.Name, s);
    }
  }

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <Title order={2}>Buckets</Title>
        <Group gap="xs">
          {dataUpdatedAt > 0 && (
            <Text size="xs" c="dimmed">
              Updated {formatTimeAgo(new Date(dataUpdatedAt))}
            </Text>
          )}
          <Tooltip label="Refresh status">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => refetch()}
              loading={isFetching}
              aria-label="Refresh scan status"
            >
              <RefreshCw size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      {buckets.length === 0 && <Text c="dimmed">No buckets found.</Text>}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }}>
        {buckets.map((b: { name: string; creationDate: string }) => (
          <BucketCard
            key={b.name}
            connectionId={connectionId}
            bucket={b}
            scanStatus={statusByName.get(b.name)}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

function BucketCard({
  connectionId,
  bucket,
  scanStatus,
}: {
  connectionId: string;
  bucket: { name: string; creationDate: string };
  scanStatus?: BucketScanStatus;
}) {
  const syncMutation = useSyncBucket(connectionId, bucket.name);
  const { data: stats, isLoading: statsLoading } = useBucketStats(connectionId, bucket.name);
  const isActive = scanStatus ? scanStatus.RunningCount > 0 || scanStatus.PendingCount > 0 : false;

  const hasDuplicates = stats && (stats.duplicateFiles > 0 || stats.duplicateFolders > 0);

  return (
    <Card
      shadow="sm"
      padding="lg"
      withBorder
      component={Link}
      to={`/${encodeURIComponent(connectionId)}/${encodeURIComponent(bucket.name)}/`}
      style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}
    >
      <Group justify="space-between" align="flex-start" mb="xs">
        <ThemeIcon variant="light" size="lg" color="como">
          <Database size={20} />
        </ThemeIcon>
        {isActive ? (
          <Badge size="sm" variant="light" color="blue">
            {scanStatus!.RunningCount} running · {scanStatus!.PendingCount} queued
          </Badge>
        ) : (
          <Tooltip label="Sync bucket">
            <ActionIcon
              variant="subtle"
              size="sm"
              aria-label={`Sync ${bucket.name}`}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                syncMutation.mutate();
              }}
              loading={syncMutation.isPending}
            >
              <RefreshCw size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      <Title order={4} mb={2}>
        {bucket.name}
      </Title>
      {isValidDate(bucket.creationDate) && (
        <Text size="xs" c="dimmed" mb="sm">
          Created {new Date(bucket.creationDate).toLocaleDateString()}
        </Text>
      )}

      {statsLoading && (
        <Stack gap={6} mt="xs">
          <Skeleton height={12} width="60%" />
          <Skeleton height={12} width="40%" />
        </Stack>
      )}

      {stats && (
        <Stack gap={6}>
          <Group gap="lg">
            <Group gap={6}>
              <Files size={13} color="var(--mantine-color-dimmed)" />
              <Text size="xs" c="dimmed">
                {stats.totalFiles.toLocaleString()} files
              </Text>
            </Group>
            <Group gap={6}>
              <HardDrive size={13} color="var(--mantine-color-dimmed)" />
              <Text size="xs" c="dimmed">
                {formatBytes(stats.totalSize)}
              </Text>
            </Group>
          </Group>

          {hasDuplicates && (
            <>
              <Divider />
              <Group gap="lg">
                {stats.duplicateFiles > 0 && (
                  <Group gap={6}>
                    <Copy size={13} color="var(--mantine-color-yellow-6)" />
                    <Text size="xs" c="yellow.6">
                      {stats.duplicateFiles.toLocaleString()} dup files
                    </Text>
                  </Group>
                )}
                {stats.duplicateFolders > 0 && (
                  <Group gap={6}>
                    <FolderSync size={13} color="var(--mantine-color-yellow-6)" />
                    <Text size="xs" c="yellow.6">
                      {stats.duplicateFolders.toLocaleString()} dup folders
                    </Text>
                  </Group>
                )}
              </Group>
              {stats.storageReclaimable > 0 && (
                <Group gap={6}>
                  <Recycle size={13} color="var(--mantine-color-orange-6)" />
                  <Text size="xs" fw={500} c="orange">
                    {formatBytes(stats.storageReclaimable)} reclaimable
                  </Text>
                </Group>
              )}
            </>
          )}
        </Stack>
      )}
    </Card>
  );
}
