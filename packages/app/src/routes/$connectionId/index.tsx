import { Suspense, useEffect } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { Center, Loader } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { BucketList } from "../../components/BucketList";
import { useConnection } from "../$connectionId";

function ErrorFallback({ error }: FallbackProps) {
  const connection = useConnection();
  const navigate = useNavigate();

  useEffect(() => {
    navigate({
      to: "/connections",
      search: {
        error: connection?.name ?? "Unknown",
        message: error instanceof Error ? error.message : String(error),
      },
    });
  }, [navigate, connection, error]);

  return null;
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
