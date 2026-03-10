import { Alert, Table, Text, Tooltip } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { Copy, FolderSync } from "lucide-react";
import type { ObjectInfo } from "@shoebox/api";
import { MimeIcon } from "./MimeIcon";
import { ObjectActions } from "./ObjectActions";
import { useConnectionId } from "../routes/$connectionId";
import { useBucket } from "../contexts/bucket";
import {
  useAllDuplicatesForPrefix,
  useAllDuplicateDirsForPrefix,
  useDirStats,
} from "../hooks/queries";
import { sortDuplicatesByRelevance } from "../lib/duplicate-sort";

interface FolderRow {
  type: "folder";
  name: string;
  prefix: string;
}

interface ObjectRow {
  type: "object";
  name: string;
  info: ObjectInfo;
}

type Row = FolderRow | ObjectRow;

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

interface ObjectTableProps {
  prefix: string;
  folders: string[];
  objects: ObjectInfo[];
  footer?: React.ReactNode;
}

export function ObjectTable({ prefix, folders, objects, footer }: ObjectTableProps) {
  const connectionId = useConnectionId();
  const bucket = useBucket();
  // Directory size stats (non-blocking)
  const { data: dirStatsData } = useDirStats(connectionId, bucket, prefix);
  const folderSizeMap = new Map<string, number>();
  if (dirStatsData) {
    for (const d of dirStatsData.dirs) {
      folderSizeMap.set(d.prefix, d.total_size);
    }
  }

  // Duplicate directories from backend (folder IS a duplicate of another folder)
  const { data: dirPages } = useAllDuplicateDirsForPrefix(connectionId, bucket, prefix, 1);
  const duplicateFolders = new Set<string>();
  if (dirPages) {
    for (const page of dirPages.pages) {
      for (const group of page.duplicate_dirs) {
        for (const dir of group.dirs) {
          if (folders.includes(dir.prefix)) {
            duplicateFolders.add(dir.prefix);
          }
        }
      }
    }
  }

  // Check if the current folder itself is a duplicate of another folder
  const currentFolderDuplicates: string[] = [];
  if (dirPages) {
    for (const page of dirPages.pages) {
      for (const group of page.duplicate_dirs) {
        const match = group.dirs.some((d) => d.prefix === prefix);
        if (match) {
          for (const dir of group.dirs) {
            if (dir.prefix !== prefix) {
              currentFolderDuplicates.push(dir.prefix);
            }
          }
        }
      }
    }
  }

  // File-level duplicates from backend (folder CONTAINS duplicate files)
  const { data: dupPages } = useAllDuplicatesForPrefix(connectionId, bucket, prefix, 1);
  const allGroups = dupPages?.pages.flatMap((p) => p.duplicates) ?? [];
  const sortedGroups = sortDuplicatesByRelevance(allGroups, prefix);
  const containsDuplicates = new Set<string>();
  const duplicateFiles = new Set<string>();
  for (const group of sortedGroups) {
    for (const file of group.files) {
      duplicateFiles.add(file.key);
      for (const folderPrefix of folders) {
        if (file.key.startsWith(folderPrefix) && !duplicateFolders.has(folderPrefix)) {
          containsDuplicates.add(folderPrefix);
        }
      }
    }
  }

  const rows: Row[] = [
    ...folders.map(
      (f): FolderRow => ({
        type: "folder",
        name: f.slice(prefix.length).replace(/\/$/, ""),
        prefix: f,
      }),
    ),
    ...objects.map(
      (o): ObjectRow => ({
        type: "object",
        name: o.key.slice(prefix.length),
        info: o,
      }),
    ),
  ];

  return (
    <div style={{ height: "calc(100vh - 200px)", overflow: "auto" }}>
      {currentFolderDuplicates.length > 0 && (
        <Alert color="orange" icon={<FolderSync size={16} />} mb="sm">
          This folder is a duplicate of{" "}
          {currentFolderDuplicates.map((dup, i) => (
            <span key={dup}>
              {i > 0 && ", "}
              <Link
                to="/$connectionId/$bucket/$"
                params={{ connectionId, bucket, _splat: dup }}
                search={{ key: undefined }}
                style={{ fontWeight: 500 }}
              >
                {dup}
              </Link>
            </span>
          ))}
        </Alert>
      )}
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 40 }} />
            <Table.Th>Name</Table.Th>
            <Table.Th style={{ width: 100 }}>Size</Table.Th>
            <Table.Th style={{ width: 48 }} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={4}>
                <Text c="dimmed" ta="center" py="md">
                  This folder is empty.
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            rows.map((row) => (
              <Table.Tr key={row.type === "folder" ? row.prefix : row.info.key}>
                <Table.Td>
                  <MimeIcon name={row.name} isFolder={row.type === "folder"} />
                </Table.Td>
                <Table.Td>
                  {row.type === "folder" ? (
                    <Link
                      to="/$connectionId/$bucket/$"
                      params={{ connectionId, bucket, _splat: row.prefix }}
                      search={{ key: undefined }}
                      style={{
                        cursor: "pointer",
                        textDecoration: "none",
                        color: "inherit",
                        fontWeight: 500,
                        fontSize: "var(--mantine-font-size-sm)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {row.name}/
                      {duplicateFolders.has(row.prefix) && (
                        <Tooltip label="Duplicate folder">
                          <FolderSync
                            size={14}
                            style={{ color: "var(--mantine-color-orange-6)" }}
                          />
                        </Tooltip>
                      )}
                      {containsDuplicates.has(row.prefix) && (
                        <Tooltip label="Contains duplicates">
                          <Copy size={14} style={{ color: "var(--mantine-color-yellow-6)" }} />
                        </Tooltip>
                      )}
                    </Link>
                  ) : (
                    <Link
                      to="/$connectionId/$bucket/$"
                      params={{ connectionId, bucket, _splat: row.info.key }}
                      search={{ key: row.info.key }}
                      style={{
                        cursor: "pointer",
                        textDecoration: "none",
                        color: "inherit",
                        fontSize: "var(--mantine-font-size-sm)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {row.name}
                      {duplicateFiles.has(row.info.key) && (
                        <Tooltip label="Duplicate file">
                          <Copy size={14} style={{ color: "var(--mantine-color-yellow-6)" }} />
                        </Tooltip>
                      )}
                    </Link>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {row.type === "folder"
                      ? folderSizeMap.has(row.prefix)
                        ? formatBytes(folderSizeMap.get(row.prefix)!)
                        : "—"
                      : formatBytes(row.info.size)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {row.type === "object" && (
                    <ObjectActions prefix={prefix} objectKey={row.info.key} />
                  )}
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
      {footer}
    </div>
  );
}
