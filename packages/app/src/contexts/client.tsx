import { createContext, useContext, useMemo, type ReactNode } from "react";
import { ShoeboxClient, type ShoeboxConnection } from "@shoebox/api";

const ShoeboxClientContext = createContext<ShoeboxClient | null>(null);

export function ShoeboxClientProvider({
  connection,
  children,
}: {
  connection: ShoeboxConnection;
  children: ReactNode;
}) {
  const client = useMemo(
    () =>
      new ShoeboxClient({
        endpoint: connection.endpoint,
        accessKeyId: connection.accessKeyId,
        secretAccessKey: connection.secretAccessKey,
        region: connection.region,
      }),
    [connection.id],
  );

  return <ShoeboxClientContext.Provider value={client}>{children}</ShoeboxClientContext.Provider>;
}

export function useShoeboxClient(): ShoeboxClient {
  const client = useContext(ShoeboxClientContext);
  if (!client) {
    throw new Error("useShoeboxClient must be used within a ShoeboxClientProvider");
  }
  return client;
}

export function useShoeboxClientMaybe(): ShoeboxClient | null {
  return useContext(ShoeboxClientContext);
}
