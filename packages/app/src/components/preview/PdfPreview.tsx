import { Center, Loader, Alert } from "@mantine/core";
import { useObjectBlobUrl } from "../../hooks/useObjectBlobUrl";

interface PdfPreviewProps {
  bucket: string;
  objectKey: string;
}

export function PdfPreview({ bucket, objectKey }: PdfPreviewProps) {
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
        {error instanceof Error ? error.message : "Could not load PDF"}
      </Alert>
    );
  }

  if (!url) return null;

  return (
    <iframe
      src={url}
      title={objectKey.split("/").pop() || "PDF preview"}
      style={{
        width: "100%",
        height: 600,
        border: "1px solid var(--mantine-color-default-border)",
        borderRadius: "var(--mantine-radius-sm)",
      }}
    />
  );
}
