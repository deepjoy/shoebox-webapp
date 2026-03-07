import { Suspense } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { Center, Loader, Alert, Button, Stack, Text } from "@mantine/core";
import { BucketList } from "../../components/BucketList";
import { useConnection } from "../$connectionId";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Alert color="red" title="Failed to load buckets" maw={500} mx="auto" mt="xl">
      <Stack gap="sm">
        <Text size="sm">{error instanceof Error ? error.message : String(error)}</Text>
        <Button variant="outline" color="red" size="xs" onClick={resetErrorBoundary}>
          Try again
        </Button>
      </Stack>
    </Alert>
  );
}

export function BucketListPage() {
  const connection = useConnection();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[connection?.id]}>
      <Suspense
        fallback={
          <Center py="xl">
            <Loader />
          </Center>
        }
      >
        <BucketList />
      </Suspense>
    </ErrorBoundary>
  );
}
