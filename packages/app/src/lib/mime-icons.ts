import {
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  Folder,
  type LucideIcon,
} from "lucide-react";

const mimeMap: [string, LucideIcon][] = [
  ["image/", FileImage],
  ["video/", FileVideo],
  ["audio/", FileAudio],
  ["text/", FileText],
  ["application/pdf", FileText],
  ["application/json", FileCode],
  ["application/javascript", FileCode],
  ["application/xml", FileCode],
  ["application/zip", FileArchive],
  ["application/gzip", FileArchive],
  ["application/x-tar", FileArchive],
  ["application/x-rar", FileArchive],
  ["application/x-7z-compressed", FileArchive],
  ["application/vnd.ms-excel", FileSpreadsheet],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml", FileSpreadsheet],
  ["text/csv", FileSpreadsheet],
];

/** Get an icon for a content type or file extension. */
export function getIconForMime(contentType?: string): LucideIcon {
  if (!contentType) return File;
  for (const [prefix, icon] of mimeMap) {
    if (contentType.startsWith(prefix)) return icon;
  }
  return File;
}

/** Get an icon for a file by extension. */
export function getIconForKey(key: string): LucideIcon {
  const ext = key.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "svg":
    case "bmp":
    case "ico":
      return FileImage;
    case "mp4":
    case "mov":
    case "avi":
    case "mkv":
    case "webm":
      return FileVideo;
    case "mp3":
    case "wav":
    case "ogg":
    case "flac":
    case "aac":
      return FileAudio;
    case "zip":
    case "gz":
    case "tar":
    case "rar":
    case "7z":
      return FileArchive;
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "py":
    case "rs":
    case "go":
    case "java":
    case "c":
    case "cpp":
    case "h":
    case "css":
    case "html":
    case "xml":
    case "json":
    case "yaml":
    case "yml":
    case "toml":
    case "sh":
      return FileCode;
    case "csv":
    case "xls":
    case "xlsx":
      return FileSpreadsheet;
    case "txt":
    case "md":
    case "pdf":
    case "doc":
    case "docx":
    case "rtf":
      return FileText;
    default:
      return File;
  }
}

export { Folder };
