import type { ReactNode } from "react";
import { HoverCard, Stack, Text, Group, Loader } from "@mantine/core";
import { useHeadObject } from "../hooks/queries";
import { useConnectionId } from "../routes/$connectionId";
import { useBucket } from "../contexts/bucket";

interface MetadataTooltipProps {
  objectKey: string;
  children: ReactNode;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function MetadataTooltip({ objectKey, children }: MetadataTooltipProps) {
  const connectionId = useConnectionId();
  const bucket = useBucket();
  const {
    data: meta,
    isLoading: loading,
    error,
    refetch,
  } = useHeadObject(connectionId, bucket, objectKey);

  function handleOpen() {
    if (meta || loading) return;
    refetch();
  }

  return (
    <HoverCard width={320} shadow="md" openDelay={400} onOpen={handleOpen}>
      <HoverCard.Target>{children}</HoverCard.Target>
      <HoverCard.Dropdown>
        {loading && <Loader size="sm" />}
        {error && (
          <Text size="sm" c="red">
            {String(error)}
          </Text>
        )}
        {meta && (
          <Stack gap="xs">
            <MetaRow label="Content-Type" value={meta.contentType} />
            <MetaRow label="Size" value={formatBytes(meta.contentLength)} />
            <MetaRow label="ETag" value={meta.etag} />
            <MetaRow label="Last Modified" value={new Date(meta.lastModified).toLocaleString()} />
            {meta.checksumSha256 && <MetaRow label="SHA-256" value={meta.checksumSha256} />}
            {meta.checksumSha1 && <MetaRow label="SHA-1" value={meta.checksumSha1} />}
            {meta.checksumCrc32 && <MetaRow label="CRC32" value={meta.checksumCrc32} />}
            {meta.checksumCrc32c && <MetaRow label="CRC32C" value={meta.checksumCrc32c} />}
            {Object.keys(meta.metadata).length > 0 && (
              <>
                <Text size="xs" fw={600} mt={4}>
                  User Metadata
                </Text>
                {Object.entries(meta.metadata).map(([k, v]) => (
                  <MetaRow key={k} label={k} value={v as string} />
                ))}
              </>
            )}
          </Stack>
        )}
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <Group gap="xs" wrap="nowrap">
      <Text size="xs" c="dimmed" fw={500} style={{ minWidth: 90 }}>
        {label}
      </Text>
      <Text size="xs" lineClamp={1} style={{ wordBreak: "break-all" }}>
        {value}
      </Text>
    </Group>
  );
}
