import { Breadcrumbs, Group } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { Database, Folder } from "lucide-react";
import { useConnectionId } from "../routes/$connectionId";
import { useBucket } from "../contexts/bucket";
import { getIconForKey } from "../lib/mime-icons";

interface BreadcrumbNavProps {
  prefix: string;
  /** When set, renders a final non-clickable file breadcrumb with a mime icon. */
  objectName?: string;
}

export function BreadcrumbNav({ prefix, objectName }: BreadcrumbNavProps) {
  const connectionId = useConnectionId();
  const bucket = useBucket();
  const segments = prefix.split("/").filter(Boolean);

  return (
    <Breadcrumbs>
      <Link
        to="/$connectionId/$bucket/$"
        params={{ connectionId, bucket, _splat: "" }}
        search={{ key: undefined }}
        style={{
          textDecoration: "none",
          color: "var(--mantine-color-anchor)",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Database size={14} />
        {bucket}
      </Link>
      {segments.map((seg, i) => {
        const path = segments.slice(0, i + 1).join("/") + "/";
        const isLast = i === segments.length - 1 && !objectName;
        return isLast ? (
          <Group key={path} gap={4} wrap="nowrap">
            <Folder size={14} />
            <span>{seg}</span>
          </Group>
        ) : (
          <Link
            key={path}
            to="/$connectionId/$bucket/$"
            params={{ connectionId, bucket, _splat: path }}
            search={{ key: undefined }}
            style={{
              textDecoration: "none",
              color: "var(--mantine-color-anchor)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Folder size={14} />
            {seg}
          </Link>
        );
      })}
      {objectName &&
        (() => {
          const FileIcon = getIconForKey(objectName);
          return (
            <Group gap={4} wrap="nowrap">
              <FileIcon size={14} />
              <span>{objectName}</span>
            </Group>
          );
        })()}
    </Breadcrumbs>
  );
}
