import { Outlet, useParams } from "@tanstack/react-router";
import { createContext, useContext } from "react";
import type { ShoeboxConnection } from "@shoebox/api";
import { getConnection } from "../lib/connections";
import { ShoeboxClientProvider } from "../contexts/client";

const ConnectionContext = createContext<ShoeboxConnection | undefined>(undefined);

export function useConnection(): ShoeboxConnection | undefined {
  return useContext(ConnectionContext);
}

export function useConnectionId(): string {
  const connection = useContext(ConnectionContext);
  if (!connection) {
    throw new Error("useConnectionId must be used within a ConnectionLayout");
  }
  return connection.id;
}

export function ConnectionLayout() {
  const { connectionId } = useParams({ strict: false });
  const connection = connectionId ? getConnection(connectionId) : undefined;

  if (!connection) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Connection not found. Go to <a href="/connections">Connections</a> to add one.
      </div>
    );
  }

  return (
    <ConnectionContext.Provider value={connection}>
      <ShoeboxClientProvider connection={connection}>
        <Outlet />
      </ShoeboxClientProvider>
    </ConnectionContext.Provider>
  );
}
