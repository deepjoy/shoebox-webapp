import { Link, Outlet, useParams, useRouterState } from "@tanstack/react-router";
import { ActionIcon, AppShell, Breadcrumbs, Group, Text, Title, Tooltip } from "@mantine/core";
import { ChevronRight, Home, Package, Settings } from "lucide-react";
import { getConnection } from "../lib/connections";

export function RootLayout() {
  const { connectionId, bucket } = useParams({ strict: false });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isRoot = pathname === "/" || pathname === "/connections";
  const connection = connectionId ? getConnection(connectionId) : undefined;

  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Breadcrumbs
            separator={<ChevronRight size={16} color="var(--mantine-color-dimmed)" />}
            styles={{ separator: { marginInline: 4 } }}
          >
            <Link
              to={connectionId ? "/$connectionId" : "/connections"}
              params={connectionId ? { connectionId } : undefined}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Group gap="xs" style={{ cursor: "pointer" }}>
                <Package size={24} />
                <Title order={3}>Shoebox</Title>
              </Group>
            </Link>
            {!isRoot && (
              <Tooltip label="Home">
                <ActionIcon
                  component={Link}
                  to="/connections"
                  variant="subtle"
                  size="lg"
                  aria-label="Home"
                >
                  <Home size={20} />
                </ActionIcon>
              </Tooltip>
            )}
            {connection && (
              <Link
                to="/$connectionId"
                params={{ connectionId: connection.id }}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Text fw={500}>{connection.name}</Text>
              </Link>
            )}
            {bucket && <Text fw={500}>{bucket}</Text>}
          </Breadcrumbs>
          <Tooltip label="Manage connections">
            <ActionIcon
              component={Link}
              to="/connections"
              variant="subtle"
              size="lg"
              aria-label="Manage connections"
            >
              <Settings size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
