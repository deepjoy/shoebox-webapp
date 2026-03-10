import { Center, Loader, Alert } from "@mantine/core";
import { useObjectBlobUrl } from "../../hooks/useObjectBlobUrl";

interface AudioPreviewProps {
  bucket: string;
  objectKey: string;
}

export function AudioPreview({ bucket, objectKey }: AudioPreviewProps) {
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
        {error instanceof Error ? error.message : "Could not load audio"}
      </Alert>
    );
  }

  if (!url) return null;

  return (
    <Center>
      <audio controls src={url} style={{ width: "100%" }}>
        Your browser does not support the audio element.
      </audio>
    </Center>
  );
}
