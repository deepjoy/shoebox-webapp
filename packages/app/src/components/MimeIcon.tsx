import { Folder } from "lucide-react";
import { getIconForKey } from "../lib/mime-icons";

interface MimeIconProps {
  name: string;
  isFolder: boolean;
  size?: number;
}

export function MimeIcon({ name, isFolder, size = 18 }: MimeIconProps) {
  if (isFolder) {
    return <Folder size={size} />;
  }
  const Icon = getIconForKey(name);
  return <Icon size={size} />;
}
