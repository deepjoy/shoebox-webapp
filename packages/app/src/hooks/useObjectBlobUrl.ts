import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShoeboxClient } from "../contexts/client";

/**
 * Fetches an S3 object and returns a blob URL for inline preview.
 * The blob URL is revoked when the query is garbage-collected.
 */
export function useObjectBlobUrl(
  bucket: string,
  objectKey: string,
  options?: { enabled?: boolean },
) {
  const client = useShoeboxClient();

  const query = useQuery({
    queryKey: ["object-blob", bucket, objectKey],
    queryFn: async () => {
      const response = await client.getObject(bucket, objectKey);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Revoke blob URL on unmount or when URL changes
  useEffect(() => {
    return () => {
      if (query.data) {
        URL.revokeObjectURL(query.data);
      }
    };
  }, [query.data]);

  return query;
}

/**
 * Fetches an S3 object as text for text-based previews.
 */
export function useObjectText(bucket: string, objectKey: string, options?: { enabled?: boolean }) {
  const client = useShoeboxClient();

  return useQuery({
    queryKey: ["object-text", bucket, objectKey],
    queryFn: async () => {
      const response = await client.getObject(bucket, objectKey);
      return response.text();
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
