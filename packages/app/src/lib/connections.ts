import type { ShoeboxConnection } from "@shoebox/api";

const STORAGE_KEY = "shoebox-connections";

export function getConnections(): ShoeboxConnection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getConnection(id: string): ShoeboxConnection | undefined {
  return getConnections().find((c) => c.id === id);
}

export function saveConnection(conn: ShoeboxConnection): void {
  const conns = getConnections();
  const idx = conns.findIndex((c) => c.id === conn.id);
  if (idx >= 0) {
    conns[idx] = conn;
  } else {
    conns.push(conn);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conns));
}

export function deleteConnection(id: string): void {
  const conns = getConnections().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conns));
}
