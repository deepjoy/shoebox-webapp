import {
  useQuery,
  useInfiniteQuery,
  useSuspenseQuery,
  useSuspenseInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import type { ListObjectsV2Result, DuplicateReport, DuplicateDirReport } from "@shoebox/api";
import { useShoeboxClient } from "../contexts/client";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const queryKeys = {
  buckets: (connectionId: string) => ["buckets", connectionId] as const,
  objects: (connectionId: string, bucket: string, prefix: string) =>
    ["objects", connectionId, bucket, prefix] as const,
  headObject: (connectionId: string, bucket: string, key: string) =>
    ["head-object", connectionId, bucket, key] as const,
  duplicates: (connectionId: string, bucket: string, keyContains?: string, maxDepth?: number) =>
    ["duplicates", connectionId, bucket, keyContains, maxDepth] as const,
  duplicateDirs: (connectionId: string, bucket: string, prefix?: string, maxDepth?: number) =>
    ["duplicate-dirs", connectionId, bucket, prefix, maxDepth] as const,
  scanStatus: (connectionId: string) => ["scan-status", connectionId] as const,
};

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

export function useBuckets(connectionId: string) {
  const client = useShoeboxClient();
  return useSuspenseQuery({
    queryKey: queryKeys.buckets(connectionId),
    queryFn: () => client.listBuckets(),
  });
}

const PAGE_SIZE = 100;

export function useInfiniteObjects(connectionId: string, bucket: string, prefix: string) {
  const client = useShoeboxClient();
  return useSuspenseInfiniteQuery({
    queryKey: queryKeys.objects(connectionId, bucket, prefix),
    queryFn: ({ pageParam }) =>
      client.listObjectsV2(bucket, {
        prefix,
        delimiter: "/",
        maxKeys: PAGE_SIZE,
        continuationToken: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: ListObjectsV2Result) =>
      lastPage.isTruncated ? lastPage.nextContinuationToken : undefined,
  });
}

export function useHeadObject(
  connectionId: string,
  bucket: string,
  objectKey: string,
  options?: { enabled?: boolean },
) {
  const client = useShoeboxClient();
  return useQuery({
    queryKey: queryKeys.headObject(connectionId, bucket, objectKey),
    queryFn: () => client.headObject(bucket, objectKey),
    enabled: options?.enabled ?? false, // only fetch on demand by default
  });
}

export function useBucketDuplicates(
  connectionId: string,
  bucket: string,
  options?: { enabled?: boolean; keyContains?: string },
) {
  const client = useShoeboxClient();
  return useQuery({
    queryKey: queryKeys.duplicates(connectionId, bucket, options?.keyContains),
    queryFn: () =>
      client.findBucketDuplicates(bucket, {
        allowPartial: true,
        keyContains: options?.keyContains,
      }),
    enabled: options?.enabled ?? true,
  });
}

const DUPLICATES_PAGE_SIZE = 100;

export function useInfiniteDuplicates(connectionId: string, bucket: string, keyContains?: string) {
  const client = useShoeboxClient();
  return useSuspenseInfiniteQuery({
    queryKey: queryKeys.duplicates(connectionId, bucket, keyContains),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      client.findBucketDuplicates(bucket, {
        maxResults: DUPLICATES_PAGE_SIZE,
        allowPartial: true,
        continuationToken: pageParam,
        keyContains: keyContains || undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: DuplicateReport) =>
      lastPage.is_truncated ? lastPage.next_continuation_token : undefined,
  });
}

/**
 * Non-suspense infinite query that auto-fetches all pages of duplicates
 * scoped to a key prefix. Used by ObjectTable to detect which folders
 * contain duplicates without blocking render.
 */
export function useAllDuplicatesForPrefix(
  connectionId: string,
  bucket: string,
  prefix: string,
  maxDepth?: number,
) {
  const client = useShoeboxClient();
  const query = useInfiniteQuery({
    queryKey: queryKeys.duplicates(connectionId, bucket, prefix || undefined, maxDepth),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      client.findBucketDuplicates(bucket, {
        maxResults: DUPLICATES_PAGE_SIZE,
        allowPartial: true,
        continuationToken: pageParam,
        keyContains: prefix || undefined,
        maxDepth,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: DuplicateReport) =>
      lastPage.is_truncated ? lastPage.next_continuation_token : undefined,
  });

  // Auto-fetch remaining pages
  useEffect(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  return query;
}

/**
 * Non-suspense infinite query that auto-fetches all pages of duplicate
 * directories scoped to a prefix. Uses the backend duplicate-dirs endpoint.
 */
export function useAllDuplicateDirsForPrefix(
  connectionId: string,
  bucket: string,
  prefix: string,
  maxDepth?: number,
) {
  const client = useShoeboxClient();
  const query = useInfiniteQuery({
    queryKey: queryKeys.duplicateDirs(connectionId, bucket, prefix || undefined, maxDepth),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      client.findBucketDuplicateDirs(bucket, {
        maxResults: DUPLICATES_PAGE_SIZE,
        prefix: prefix || undefined,
        continuationToken: pageParam,
        maxDepth,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: DuplicateDirReport) =>
      lastPage.is_truncated ? lastPage.next_continuation_token : undefined,
  });

  // Auto-fetch remaining pages
  useEffect(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  return query;
}

export function useScanStatus(connectionId: string) {
  const client = useShoeboxClient();
  return useQuery({
    queryKey: queryKeys.scanStatus(connectionId),
    queryFn: () => client.getScanStatus(),
  });
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

export function useSyncBucket(connectionId: string, bucket: string) {
  const client = useShoeboxClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => client.syncBucket(bucket),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.scanStatus(connectionId),
      });
      queryClient.invalidateQueries({
        queryKey: ["duplicates", connectionId, bucket],
      });
    },
  });
}

export function useDeleteObject(connectionId: string, bucket: string, prefix: string) {
  const client = useShoeboxClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (objectKey: string) => client.deleteObject(bucket, objectKey),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.objects(connectionId, bucket, prefix),
      });
    },
  });
}

export function useRenameObject(connectionId: string, bucket: string, prefix: string) {
  const client = useShoeboxClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ oldKey, newKey }: { oldKey: string; newKey: string }) =>
      client.renameObject(bucket, oldKey, newKey),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.objects(connectionId, bucket, prefix),
      });
    },
  });
}
