import {
  ActionIcon,
  Badge,
  Card,
  Group,
  SimpleGrid,
  Text,
  Title,
  Stack,
  Tooltip,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { Database, RefreshCw } from "lucide-react";
import { useBuckets, useScanStatus, useSyncBucket } from "../hooks/queries";
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
              Status: {formatTimeAgo(new Date(dataUpdatedAt))}
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
  const isActive = scanStatus ? scanStatus.RunningCount > 0 || scanStatus.PendingCount > 0 : false;

  return (
    <Card
      shadow="sm"
      padding="lg"
      withBorder
      component={Link}
      to={`/${encodeURIComponent(connectionId)}/${encodeURIComponent(bucket.name)}/`}
      style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}
    >
      <Group justify="space-between" align="flex-start" mb={8}>
        <Database size={32} />
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
      <Text fw={500}>{bucket.name}</Text>
      <Text size="xs" c="dimmed">
        Created: {new Date(bucket.creationDate).toLocaleDateString()}
      </Text>
    </Card>
  );
}
