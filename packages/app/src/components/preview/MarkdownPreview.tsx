import { lazy, Suspense } from "react";
import { Center, Loader, Alert, TypographyStylesProvider } from "@mantine/core";
import { useObjectText } from "../../hooks/useObjectBlobUrl";

const ReactMarkdown = lazy(
  () => import(/* @vite-ignore */ "https://esm.sh/react-markdown@10.1.0?external=react"),
);

const MAX_DISPLAY_CHARS = 200_000;

interface MarkdownPreviewProps {
  bucket: string;
  objectKey: string;
}

export default function MarkdownPreview({ bucket, objectKey }: MarkdownPreviewProps) {
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
        {error instanceof Error ? error.message : "Could not load markdown"}
      </Alert>
    );
  }

  if (text == null) return null;

  const display =
    text.length > MAX_DISPLAY_CHARS
      ? text.slice(0, MAX_DISPLAY_CHARS) + "\n\n*… (truncated)*"
      : text;

  return (
    <TypographyStylesProvider style={{ maxHeight: 600, overflow: "auto" }}>
      <Suspense
        fallback={
          <Center py="xl">
            <Loader />
          </Center>
        }
      >
        <ReactMarkdown>{display}</ReactMarkdown>
      </Suspense>
    </TypographyStylesProvider>
  );
}
