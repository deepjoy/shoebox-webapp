import { Center, Loader, Alert } from "@mantine/core";
import { useObjectText } from "../../hooks/useObjectBlobUrl";
import { extensionToShikiLang } from "../../lib/extension-to-lang";
import { useQuery } from "@tanstack/react-query";

const MAX_DISPLAY_CHARS = 100_000;

interface CodePreviewProps {
  bucket: string;
  objectKey: string;
}

export default function CodePreview({ bucket, objectKey }: CodePreviewProps) {
  const { data: text, isLoading, error } = useObjectText(bucket, objectKey);
  const lang = extensionToShikiLang(objectKey) ?? "text";

  const { data: html, isLoading: isHighlighting } = useQuery({
    queryKey: ["shiki-highlight", bucket, objectKey, lang],
    queryFn: async () => {
      // Load shiki from CDN — grammars/themes are also fetched from CDN on demand
      const { codeToHtml } = await import(
        /* @vite-ignore */ "https://esm.sh/shiki@4.0.2/bundle/web"
      );
      const display =
        text!.length > MAX_DISPLAY_CHARS
          ? text!.slice(0, MAX_DISPLAY_CHARS) + "\n\n… (truncated)"
          : text!;
      return codeToHtml(display, { lang, theme: "github-dark" });
    },
    enabled: text != null,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  if (isLoading || isHighlighting) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Preview failed">
        {error instanceof Error ? error.message : "Could not load code"}
      </Alert>
    );
  }

  if (!html) return null;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        maxHeight: 500,
        overflow: "auto",
        borderRadius: "var(--mantine-radius-sm)",
      }}
    />
  );
}
