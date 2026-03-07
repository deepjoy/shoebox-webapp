import { useState } from "react";
import { ActionIcon, Menu, Modal, TextInput, Button, Group, Text, Stack } from "@mantine/core";
import { MoreVertical, Download, PenLine, Trash2 } from "lucide-react";
import { useShoeboxClient } from "../contexts/client";
import { useDeleteObject, useRenameObject } from "../hooks/queries";
import { useConnectionId } from "../routes/$connectionId";
import { useBucket } from "../contexts/bucket";

interface ObjectActionsProps {
  prefix: string;
  objectKey: string;
}

export function ObjectActions({ prefix, objectKey }: ObjectActionsProps) {
  const client = useShoeboxClient();
  const connectionId = useConnectionId();
  const bucket = useBucket();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const deleteMutation = useDeleteObject(connectionId, bucket, prefix);
  const renameMutation = useRenameObject(connectionId, bucket, prefix);

  const fileName = objectKey.split("/").pop() || objectKey;

  async function handleDownload() {
    const response = await client.getObject(bucket, objectKey);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleRename() {
    const keyPrefix = objectKey.substring(0, objectKey.lastIndexOf("/") + 1);
    renameMutation.mutate(
      { oldKey: objectKey, newKey: keyPrefix + newName },
      { onSuccess: () => setRenameOpen(false) },
    );
  }

  function handleDelete() {
    deleteMutation.mutate(objectKey, {
      onSuccess: () => setDeleteOpen(false),
    });
  }

  return (
    <>
      <Menu shadow="md" position="bottom-end">
        <Menu.Target>
          <ActionIcon variant="subtle" aria-label="Actions">
            <MoreVertical size={16} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<Download size={14} />} onClick={handleDownload}>
            Download
          </Menu.Item>
          <Menu.Item
            leftSection={<PenLine size={14} />}
            onClick={() => {
              setNewName(fileName);
              setRenameOpen(true);
            }}
          >
            Rename
          </Menu.Item>
          <Menu.Item
            leftSection={<Trash2 size={14} />}
            color="red"
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal opened={renameOpen} onClose={() => setRenameOpen(false)} title="Rename Object">
        <Stack>
          <TextInput
            label="New name"
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} loading={renameMutation.isPending}>
              Rename
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Object">
        <Stack>
          <Text>
            Are you sure you want to delete <b>{fileName}</b>?
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={deleteMutation.isPending}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
