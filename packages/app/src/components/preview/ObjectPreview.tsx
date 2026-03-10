import { lazy, Suspense, useState } from "react";
import { Button, Center, Loader, Text, Stack } from "@mantine/core";
import { Eye } from "lucide-react";
import { ImagePreview } from "./ImagePreview";
import { TextPreview } from "./TextPreview";
import { PdfPreview } from "./PdfPreview";
import { AudioPreview } from "./AudioPreview";
import { VideoPreview } from "./VideoPreview";
import { CODE_EXTENSIONS } from "../../lib/extension-to-lang";

const CodePreview = lazy(() => import("./CodePreview"));
const MarkdownPreview = lazy(() => import("./MarkdownPreview"));
const CsvPreview = lazy(() => import("./CsvPreview"));

// Auto-preview size limits (bytes)
const SIZE_LIMITS: Record<string, number> = {
  image: 20 * 1024 * 1024,
  text: 512 * 1024,
  code: 512 * 1024,
  markdown: 512 * 1024,
  csv: 5 * 1024 * 1024,
  pdf: 50 * 1024 * 1024,
  audio: 100 * 1024 * 1024,
  video: 100 * 1024 * 1024,
};

const TEXT_TYPES = new Set([
  "application/json",
  "application/xml",
  "application/x-yaml",
  "application/javascript",
  "application/typescript",
]);

type PreviewKind = "image" | "text" | "code" | "markdown" | "csv" | "pdf" | "audio" | "video";

function getPreviewKind(contentType: string, objectKey: string): PreviewKind | null {
  const ext = objectKey.split("/").pop()?.split(".").pop()?.toLowerCase() ?? "";

  // Markdown — check before generic text/
  if (contentType === "text/markdown" || ext === "md") return "markdown";

  // CSV / TSV
  if (
    contentType === "text/csv" ||
    contentType === "text/tab-separated-values" ||
    ext === "csv" ||
    ext === "tsv"
  )
    return "csv";

  // Code — text-like MIME with a recognised programming extension
  if ((contentType.startsWith("text/") || TEXT_TYPES.has(contentType)) && CODE_EXTENSIONS.has(ext))
    return "code";

  // Existing kinds
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("text/")) return "text";
  if (contentType.startsWith("audio/")) return "audio";
  if (contentType.startsWith("video/")) return "video";
  if (contentType === "application/pdf") return "pdf";
  if (TEXT_TYPES.has(contentType)) return "text";

  return null;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

interface ObjectPreviewProps {
  bucket: string;
  objectKey: string;
  contentType: string;
  contentLength: number;
}

export function ObjectPreview({
  bucket,
  objectKey,
  contentType,
  contentLength,
}: ObjectPreviewProps) {
  const kind = getPreviewKind(contentType, objectKey);
  if (!kind) return null;

  const sizeLimit = SIZE_LIMITS[kind];
  const autoLoad = contentLength <= sizeLimit;

  return (
    <PreviewGate
      bucket={bucket}
      objectKey={objectKey}
      kind={kind}
      autoLoad={autoLoad}
      contentLength={contentLength}
    />
  );
}

const LazyFallback = (
  <Center py="xl">
    <Loader />
  </Center>
);

function PreviewGate({
  bucket,
  objectKey,
  kind,
  autoLoad,
  contentLength,
}: {
  bucket: string;
  objectKey: string;
  kind: PreviewKind;
  autoLoad: boolean;
  contentLength: number;
}) {
  const [load, setLoad] = useState(autoLoad);

  if (!load) {
    return (
      <Center py="md">
        <Stack align="center" gap="xs">
          <Text size="sm" c="dimmed">
            Preview not auto-loaded ({formatBytes(contentLength)})
          </Text>
          <Button
            variant="light"
            size="xs"
            leftSection={<Eye size={14} />}
            onClick={() => setLoad(true)}
          >
            Load preview
          </Button>
        </Stack>
      </Center>
    );
  }

  switch (kind) {
    case "image":
      return <ImagePreview bucket={bucket} objectKey={objectKey} />;
    case "text":
      return <TextPreview bucket={bucket} objectKey={objectKey} />;
    case "pdf":
      return <PdfPreview bucket={bucket} objectKey={objectKey} />;
    case "audio":
      return <AudioPreview bucket={bucket} objectKey={objectKey} />;
    case "video":
      return <VideoPreview bucket={bucket} objectKey={objectKey} />;
    case "code":
      return (
        <Suspense fallback={LazyFallback}>
          <CodePreview bucket={bucket} objectKey={objectKey} />
        </Suspense>
      );
    case "markdown":
      return (
        <Suspense fallback={LazyFallback}>
          <MarkdownPreview bucket={bucket} objectKey={objectKey} />
        </Suspense>
      );
    case "csv":
      return (
        <Suspense fallback={LazyFallback}>
          <CsvPreview bucket={bucket} objectKey={objectKey} />
        </Suspense>
      );
  }
}
