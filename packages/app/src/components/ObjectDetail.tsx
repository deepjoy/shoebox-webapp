import {
  Stack,
  Group,
  Text,
  Card,
  Loader,
  Center,
  Button,
  Alert,
  Table,
  Breadcrumbs,
} from "@mantine/core";
import { Download, PenLine, Trash2, Copy, Database, Folder } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Modal, TextInput } from "@mantine/core";
import { MimeIcon } from "./MimeIcon";
import {
  useHeadObject,
  useDeleteObject,
  useRenameObject,
  useBucketDuplicates,
} from "../hooks/queries";
import { sortDuplicatesByRelevance } from "../lib/duplicate-sort";
import { useShoeboxClient } from "../contexts/client";
import { useConnectionId } from "../routes/$connectionId";
import { useBucket } from "../contexts/bucket";
import { BreadcrumbNav } from "./Breadcrumb";
import { getIconForKey } from "../lib/mime-icons";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

interface ObjectDetailProps {
  objectKey: string;
}

export function ObjectDetail({ objectKey }: ObjectDetailProps) {
  const connectionId = useConnectionId();
  const bucket = useBucket();
  const client = useShoeboxClient();
  const navigate = useNavigate();

  const {
    data: meta,
    isLoading,
    error,
  } = useHeadObject(connectionId, bucket, objectKey, { enabled: true });
  const { data: dupReport } = useBucketDuplicates(connectionId, bucket, {
    enabled: !!meta?.checksumSha256,
    keyContains: objectKey,
  });

  const duplicates = useMemo(() => {
    if (!meta?.checksumSha256 || !dupReport?.duplicates) return [];
    const sorted = sortDuplicatesByRelevance(dupReport.duplicates, objectKey);
    const group = sorted.find(
      (g: { checksum_sha256: string }) => g.checksum_sha256 === meta.checksumSha256,
    );
    if (!group) return [];
    return group.files.filter((f: { key: string }) => f.key !== objectKey);
  }, [meta?.checksumSha256, dupReport, objectKey]);

  const prefix = objectKey.substring(0, objectKey.lastIndexOf("/") + 1);
  const fileName = objectKey.split("/").pop() || objectKey;

  const deleteMutation = useDeleteObject(connectionId, bucket, prefix);
  const renameMutation = useRenameObject(connectionId, bucket, prefix);

  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newName, setNewName] = useState("");

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
    renameMutation.mutate(
      { oldKey: objectKey, newKey: prefix + newName },
      {
        onSuccess: () => {
          setRenameOpen(false);
          navigate({
            to: "/$connectionId/$bucket/$",
            params: { connectionId, bucket, _splat: prefix + newName },
            search: { key: prefix + newName },
          });
        },
      },
    );
  }

  function handleDelete() {
    deleteMutation.mutate(objectKey, {
      onSuccess: () => {
        setDeleteOpen(false);
        navigate({
          to: "/$connectionId/$bucket/$",
          params: { connectionId, bucket, _splat: prefix || "" },
          search: { key: undefined },
        });
      },
    });
  }

  return (
    <Stack>
      <BreadcrumbNav prefix={prefix} objectName={fileName} />

      <Card withBorder>
        <Stack gap="md">
          <Group gap="sm">
            <MimeIcon name={fileName} isFolder={false} size={24} />
            <Text fw={600} size="lg">
              {fileName}
            </Text>
          </Group>

          {isLoading && (
            <Center py="xl">
              <Loader />
            </Center>
          )}

          {error && (
            <Alert color="red" title="Failed to load metadata">
              {error instanceof Error ? error.message : String(error)}
            </Alert>
          )}

          {meta && (
            <>
              <Table>
                <Table.Tbody>
                  <MetaRow label="Key" value={objectKey} />
                  <MetaRow label="Content-Type" value={meta.contentType} />
                  <MetaRow label="Size" value={formatBytes(meta.contentLength)} />
                  <MetaRow label="ETag" value={meta.etag} />
                  <MetaRow
                    label="Last Modified"
                    value={new Date(meta.lastModified).toLocaleString()}
                  />
                  {meta.checksumSha256 && <MetaRow label="SHA-256" value={meta.checksumSha256} />}
                  {meta.checksumSha1 && <MetaRow label="SHA-1" value={meta.checksumSha1} />}
                  {meta.checksumCrc32 && <MetaRow label="CRC32" value={meta.checksumCrc32} />}
                  {meta.checksumCrc32c && <MetaRow label="CRC32C" value={meta.checksumCrc32c} />}
                </Table.Tbody>
              </Table>

              {Object.keys(meta.metadata).length > 0 && (
                <>
                  <Text fw={600} size="sm" mt="xs">
                    User Metadata
                  </Text>
                  <Table>
                    <Table.Tbody>
                      {Object.entries(meta.metadata).map(([k, v]) => (
                        <MetaRow key={k} label={k} value={v as string} />
                      ))}
                    </Table.Tbody>
                  </Table>
                </>
              )}

              <Text fw={600} size="sm" mt="xs">
                <Group gap={6}>
                  <Copy size={14} />
                  Duplicates
                </Group>
              </Text>
              {!meta.checksumSha256 ? (
                <Text size="sm" c="dimmed">
                  Checksum not computed yet — run a sync to detect duplicates.
                </Text>
              ) : dupReport && duplicates.length === 0 ? (
                <Text size="sm" c="dimmed">
                  No duplicates found.
                </Text>
              ) : duplicates.length > 0 ? (
                <Stack gap="xs">
                  {duplicates.map((file: { object_id: string; key: string }) => {
                    const dupPrefix = file.key.substring(0, file.key.lastIndexOf("/") + 1);
                    const dupFileName = file.key.split("/").pop() || file.key;
                    const dupSegments = dupPrefix.split("/").filter(Boolean);
                    const FileIcon = getIconForKey(dupFileName);
                    const linkStyle = {
                      textDecoration: "none",
                      color: "var(--mantine-color-anchor)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "var(--mantine-font-size-sm)",
                    };
                    return (
                      <Breadcrumbs
                        key={file.object_id}
                        style={{ fontSize: "var(--mantine-font-size-sm)" }}
                      >
                        <Link
                          to="/$connectionId/$bucket/$"
                          params={{ connectionId, bucket, _splat: "" }}
                          search={{ key: undefined }}
                          style={linkStyle}
                        >
                          <Database size={14} />
                          {bucket}
                        </Link>
                        {dupSegments.map((seg, i) => {
                          const path = dupSegments.slice(0, i + 1).join("/") + "/";
                          return (
                            <Link
                              key={path}
                              to="/$connectionId/$bucket/$"
                              params={{ connectionId, bucket, _splat: path }}
                              search={{ key: undefined }}
                              style={linkStyle}
                            >
                              <Folder size={14} />
                              {seg}
                            </Link>
                          );
                        })}
                        <Link
                          to="/$connectionId/$bucket/$"
                          params={{ connectionId, bucket, _splat: dupPrefix || "" }}
                          search={{ key: file.key }}
                          style={{ ...linkStyle, color: "inherit" }}
                        >
                          <FileIcon size={14} />
                          {dupFileName}
                        </Link>
                      </Breadcrumbs>
                    );
                  })}
                </Stack>
              ) : (
                <Loader size="xs" />
              )}

              <Group mt="md">
                <Button leftSection={<Download size={16} />} onClick={handleDownload}>
                  Download
                </Button>
                <Button
                  variant="default"
                  leftSection={<PenLine size={16} />}
                  onClick={() => {
                    setNewName(fileName);
                    setRenameOpen(true);
                  }}
                >
                  Rename
                </Button>
                <Button
                  variant="default"
                  color="red"
                  leftSection={<Trash2 size={16} />}
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Card>

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
    </Stack>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <Table.Tr>
      <Table.Td style={{ width: 140 }}>
        <Text size="sm" c="dimmed" fw={500}>
          {label}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" style={{ wordBreak: "break-all" }}>
          {value}
        </Text>
      </Table.Td>
    </Table.Tr>
  );
}
