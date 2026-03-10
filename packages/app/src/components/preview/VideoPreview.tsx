import { Center, Loader, Alert } from "@mantine/core";
import { useObjectBlobUrl } from "../../hooks/useObjectBlobUrl";

interface VideoPreviewProps {
  bucket: string;
  objectKey: string;
}

export function VideoPreview({ bucket, objectKey }: VideoPreviewProps) {
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
        {error instanceof Error ? error.message : "Could not load video"}
      </Alert>
    );
  }

  if (!url) return null;

  return (
    <Center>
      <video
        controls
        src={url}
        style={{
          maxWidth: "100%",
          maxHeight: 600,
          borderRadius: "var(--mantine-radius-sm)",
        }}
      >
        Your browser does not support the video element.
      </video>
    </Center>
  );
}
