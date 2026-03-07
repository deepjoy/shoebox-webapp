import { Link, Outlet, useParams } from "@tanstack/react-router";
import { ActionIcon, AppShell, Group, Title, Tooltip } from "@mantine/core";
import { Package, Settings } from "lucide-react";

export function RootLayout() {
  const { connectionId } = useParams({ strict: false });

  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
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
