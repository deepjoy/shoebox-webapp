import { Center, Loader, Alert, Code } from "@mantine/core";
import { useObjectText } from "../../hooks/useObjectBlobUrl";

const MAX_DISPLAY_CHARS = 100_000;

interface TextPreviewProps {
  bucket: string;
  objectKey: string;
}

export function TextPreview({ bucket, objectKey }: TextPreviewProps) {
  const { data: text, isLoading, error } = useObjectText(bucket, objectKey);

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
        {error instanceof Error ? error.message : "Could not load text"}
      </Alert>
    );
  }

  if (text == null) return null;

  const truncated = text.length > MAX_DISPLAY_CHARS;
  const display = truncated ? text.slice(0, MAX_DISPLAY_CHARS) : text;

  return (
    <Code
      block
      style={{
        maxHeight: 500,
        overflow: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {display}
      {truncated && "\n\n… (truncated)"}
    </Code>
  );
}
