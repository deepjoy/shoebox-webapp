import { useCallback, useEffect, useRef } from "react";
import { Stack, Loader, Center, Text } from "@mantine/core";
import { BreadcrumbNav } from "./Breadcrumb";
import { ObjectTable } from "./ObjectTable";
import { useInfiniteObjects } from "../hooks/queries";
import { useConnectionId } from "../routes/$connectionId";
import { useBucket } from "../contexts/bucket";

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

  return (
    <Stack>
      <BreadcrumbNav prefix={prefix} />
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
