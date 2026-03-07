import { useState } from "react";
import {
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
  ActionIcon,
  SimpleGrid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { ShoeboxConnection } from "@shoebox/api";
import { getConnections, saveConnection, deleteConnection } from "../lib/connections";

export function ConnectionManager() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState(getConnections);
  const [editing, setEditing] = useState<ShoeboxConnection | null>(null);
  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      endpoint: "",
      accessKeyId: "",
      secretAccessKey: "",
      region: "us-east-1",
    },
    validate: {
      name: (v) => (v.trim() ? null : "Name is required"),
      endpoint: (v) => (v.trim() ? null : "Endpoint is required"),
      accessKeyId: (v) => (v.trim() ? null : "Access key is required"),
      secretAccessKey: (v) => (v.trim() ? null : "Secret key is required"),
    },
  });

  function openNew() {
    setEditing(null);
    form.reset();
    setOpened(true);
  }

  function openEdit(conn: ShoeboxConnection) {
    setEditing(conn);
    form.setValues({
      name: conn.name,
      endpoint: conn.endpoint,
      accessKeyId: conn.accessKeyId,
      secretAccessKey: conn.secretAccessKey,
      region: conn.region || "us-east-1",
    });
    setOpened(true);
  }

  function handleSubmit(values: typeof form.values) {
    const conn: ShoeboxConnection = {
      id: editing?.id || crypto.randomUUID(),
      ...values,
    };
    saveConnection(conn);
    setConnections(getConnections());
    setOpened(false);
  }

  function handleDelete(id: string) {
    deleteConnection(id);
    setConnections(getConnections());
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Connections</Title>
        <Button leftSection={<Plus size={16} />} onClick={openNew}>
          Add Connection
        </Button>
      </Group>

      {connections.length === 0 && (
        <Text c="dimmed">No connections yet. Add one to get started.</Text>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        {connections.map((conn) => (
          <Card key={conn.id} shadow="sm" padding="lg" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>{conn.name}</Text>
              <Group gap="xs">
                <ActionIcon variant="subtle" onClick={() => openEdit(conn)} aria-label="Edit">
                  <Pencil size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => handleDelete(conn.id)}
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </ActionIcon>
              </Group>
            </Group>
            <Text size="sm" c="dimmed" lineClamp={1}>
              {conn.endpoint}
            </Text>
            <Button
              variant="light"
              fullWidth
              mt="md"
              onClick={() =>
                navigate({
                  to: "/$connectionId",
                  params: { connectionId: conn.id },
                })
              }
            >
              Connect
            </Button>
          </Card>
        ))}
      </SimpleGrid>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={editing ? "Edit Connection" : "New Connection"}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput label="Name" {...form.getInputProps("name")} />
            <TextInput
              label="Endpoint"
              placeholder="http://localhost:9000"
              {...form.getInputProps("endpoint")}
            />
            <TextInput label="Access Key ID" {...form.getInputProps("accessKeyId")} />
            <TextInput
              label="Secret Access Key"
              type="password"
              {...form.getInputProps("secretAccessKey")}
            />
            <TextInput label="Region" placeholder="us-east-1" {...form.getInputProps("region")} />
            <Button type="submit">{editing ? "Save" : "Create"}</Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
