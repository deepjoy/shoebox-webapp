import { useCallback, useEffect, useRef } from "react";
import { Badge, Button, Drawer, Group, Stack, Loader, Center, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { RefreshCw, FolderSync } from "lucide-react";
import { BreadcrumbNav } from "./Breadcrumb";
import { DuplicateFoldersList } from "./DuplicateFoldersList";
import { ObjectTable } from "./ObjectTable";
import { useInfiniteObjects, useSyncBucket, useScanStatus, useBucketStats } from "../hooks/queries";
import { useConnectionId } from "../routes/$connectionId";
import { useBucket } from "../contexts/bucket";
import type { BucketScanStatus } from "@shoebox/api";

interface ObjectBrowserProps {
  prefix: string;
}

export function ObjectBrowser({ prefix }: ObjectBrowserProps) {
  const connectionId = useConnectionId();
  const bucket = useBucket();
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteObjects(
    connectionId,
    bucket,
    prefix,
  );

  // Flatten paginated results
  const objects = data.pages.flatMap((p) => p.contents);
  const folders = data.pages[0]?.commonPrefixes ?? [];

  // IntersectionObserver for infinite scroll sentinel
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 },
      );
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  // Clean up observer on unmount
  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  const isRoot = prefix === "";

  return (
    <Stack>
      <BreadcrumbNav prefix={prefix} />
      {isRoot && <BucketActions />}
      <ObjectTable
        prefix={prefix}
        folders={folders}
        objects={objects}
        footer={
          <>
            {isFetchingNextPage && (
              <Center py="sm">
                <Loader size="sm" />
              </Center>
            )}
            {hasNextPage && !isFetchingNextPage && <div ref={sentinelRef} style={{ height: 1 }} />}
            {!hasNextPage && objects.length > 0 && (
              <Text size="sm" c="dimmed" ta="center" py="sm">
                {objects.length} object{objects.length !== 1 ? "s" : ""}
                {folders.length > 0 &&
                  `, ${folders.length} folder${folders.length !== 1 ? "s" : ""}`}
              </Text>
            )}
          </>
        }
      />
    </Stack>
  );
}

function BucketActions() {
  const connectionId = useConnectionId();
  const bucket = useBucket();
  const syncMutation = useSyncBucket(connectionId, bucket);
  const { data: scanStatuses } = useScanStatus(connectionId);
  const { data: stats } = useBucketStats(connectionId, bucket);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  const scanStatus: BucketScanStatus | undefined = scanStatuses?.find(
    (s: BucketScanStatus) => s.Name === bucket,
  );
  const isActive = scanStatus ? scanStatus.RunningCount > 0 || scanStatus.PendingCount > 0 : false;
  const hasDuplicateFolders = stats ? stats.duplicateFolders > 0 : false;

  return (
    <>
      <Group gap="xs">
        {isActive ? (
          <Badge size="lg" variant="light" color="blue">
            {scanStatus!.RunningCount} running &middot; {scanStatus!.PendingCount} queued
          </Badge>
        ) : (
          <Button
            variant="default"
            size="xs"
            leftSection={<RefreshCw size={14} />}
            onClick={() => syncMutation.mutate()}
            loading={syncMutation.isPending}
          >
            Re-scan
          </Button>
        )}
        {hasDuplicateFolders && (
          <Button
            variant="default"
            size="xs"
            leftSection={<FolderSync size={14} />}
            onClick={openDrawer}
          >
            Duplicate folders ({stats!.duplicateFolders})
          </Button>
        )}
      </Group>
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title="Duplicate Folders"
        position="right"
        size="md"
      >
        <DuplicateFoldersList onNavigate={closeDrawer} />
      </Drawer>
    </>
  );
}
