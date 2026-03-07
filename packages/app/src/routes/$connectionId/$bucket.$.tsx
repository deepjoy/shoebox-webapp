import { Suspense } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { useParams, useSearch } from "@tanstack/react-router";
import { Center, Loader, Alert, Button, Stack, Text } from "@mantine/core";
import { ObjectBrowser } from "../../components/ObjectBrowser";
import { ObjectDetail } from "../../components/ObjectDetail";
import { useConnection } from "../$connectionId";
import { BucketProvider } from "../../contexts/bucket";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Alert color="red" title="Failed to load objects" maw={500} mx="auto" mt="xl">
      <Stack gap="sm">
        <Text size="sm">{error instanceof Error ? error.message : String(error)}</Text>
        <Button variant="outline" color="red" size="xs" onClick={resetErrorBoundary}>
          Try again
        </Button>
      </Stack>
    </Alert>
  );
}

export function ObjectBrowserPage() {
  const connection = useConnection();
  const { bucket, _splat } = useParams({ strict: false });
  const { key } = useSearch({ strict: false }) as { key?: string };
  // Ensure folder prefix always ends with "/" so S3 scopes correctly.
  // The router may strip the trailing slash from the splat param.
  const prefix = _splat ? (_splat.endsWith("/") ? _splat : _splat + "/") : "";

  if (!bucket) return null;

  return (
    <BucketProvider bucket={bucket}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        resetKeys={[connection?.id, bucket, prefix, key]}
      >
        <Suspense
          fallback={
            <Center py="xl">
              <Loader />
            </Center>
          }
        >
          {key ? <ObjectDetail objectKey={key} /> : <ObjectBrowser prefix={prefix} />}
        </Suspense>
      </ErrorBoundary>
    </BucketProvider>
  );
}
