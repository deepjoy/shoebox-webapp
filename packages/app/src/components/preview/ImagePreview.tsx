import { Center, Loader, Alert } from "@mantine/core";
import { useObjectBlobUrl } from "../../hooks/useObjectBlobUrl";

interface ImagePreviewProps {
  bucket: string;
  objectKey: string;
}

export function ImagePreview({ bucket, objectKey }: ImagePreviewProps) {
  const { data: url, isLoading, error } = useObjectBlobUrl(bucket, objectKey);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Preview failed">
        {error instanceof Error ? error.message : "Could not load image"}
      </Alert>
    );
  }

  if (!url) return null;

  return (
    <Center>
      <img
        src={url}
        alt={objectKey.split("/").pop() || objectKey}
        style={{
          maxWidth: "100%",
          maxHeight: 600,
          borderRadius: "var(--mantine-radius-sm)",
        }}
      />
    </Center>
  );
}
