// Type declarations for CDN-imported modules (esm.sh)
declare module "https://esm.sh/shiki@4.0.2/bundle/web" {
  export const codeToHtml: (
    code: string,
    options: { lang: string; theme: string },
  ) => Promise<string>;
}

declare module "https://esm.sh/papaparse@5.5.3" {
  const Papa: {
    parse<T>(
      input: string,
      config?: {
        delimiter?: string;
        header?: boolean;
        preview?: number;
      },
    ): { data: T[]; errors: unknown[]; meta: unknown };
  };
  export default Papa;
}

declare module "https://esm.sh/react-markdown@10.1.0?external=react" {
  import type { ComponentType, ReactNode } from "react";
  const ReactMarkdown: ComponentType<{ children?: ReactNode }>;
  export default ReactMarkdown;
}
