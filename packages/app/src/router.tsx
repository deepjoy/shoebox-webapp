import { createRouter, createRootRoute, createRoute, redirect } from "@tanstack/react-router";
import { RootLayout } from "./routes/__root";
import { ConnectionsPage } from "./routes/connections";
import { ConnectionLayout } from "./routes/$connectionId";
import { BucketListPage } from "./routes/$connectionId/index";
import { ObjectBrowserPage } from "./routes/$connectionId/$bucket.$";
import { getConnections } from "./lib/connections";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    const conns = getConnections();
    if (conns.length > 0) {
      throw redirect({ to: "/$connectionId", params: { connectionId: conns[0].id } });
    }
    throw redirect({ to: "/connections", search: { error: undefined, message: undefined } });
  },
});

const connectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/connections",
  component: ConnectionsPage,
  validateSearch: (search: Record<string, unknown>) => ({
    error: (search.error as string) || undefined,
    message: (search.message as string) || undefined,
  }),
});

const connectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$connectionId",
  component: ConnectionLayout,
});

const bucketListRoute = createRoute({
  getParentRoute: () => connectionRoute,
  path: "/",
  component: BucketListPage,
});

const objectBrowserRoute = createRoute({
  getParentRoute: () => connectionRoute,
  path: "/$bucket/$",
  component: ObjectBrowserPage,
  validateSearch: (search: Record<string, unknown>) => ({
    key: (search.key as string) || undefined,
  }),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  connectionsRoute,
  connectionRoute.addChildren([bucketListRoute, objectBrowserRoute]),
]);

export const router = createRouter({ routeTree, basepath: "/shoebox-webapp" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
