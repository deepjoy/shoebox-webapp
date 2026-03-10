/** Maps file extensions to Shiki language identifiers (shiki/bundle/web). */
const EXT_TO_LANG: Record<string, string> = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "jsx",
  ts: "typescript",
  mts: "typescript",
  cts: "typescript",
  tsx: "tsx",
  py: "python",
  rs: "rust",
  go: "go",
  java: "java",
  c: "c",
  cpp: "cpp",
  h: "c",
  hpp: "cpp",
  cs: "csharp",
  css: "css",
  scss: "scss",
  less: "less",
  html: "html",
  htm: "html",
  xml: "xml",
  json: "json",
  jsonc: "jsonc",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  sql: "sql",
  rb: "ruby",
  php: "php",
  swift: "swift",
  kt: "kotlin",
  lua: "lua",
  r: "r",
  dockerfile: "dockerfile",
  makefile: "makefile",
  graphql: "graphql",
  gql: "graphql",
  vue: "vue",
  svelte: "svelte",
};

export const CODE_EXTENSIONS = new Set(Object.keys(EXT_TO_LANG));

export function extensionToShikiLang(objectKey: string): string | null {
  const parts = objectKey.split("/").pop()?.split(".") ?? [];
  // Handle extensionless filenames like "Dockerfile" or "Makefile"
  const name = parts[0]?.toLowerCase() ?? "";
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : name;
  return EXT_TO_LANG[ext] ?? null;
}
