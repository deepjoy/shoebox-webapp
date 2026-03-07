import { createContext, useContext, type ReactNode } from "react";

const BucketContext = createContext<string | undefined>(undefined);

export function BucketProvider({ bucket, children }: { bucket: string; children: ReactNode }) {
  return <BucketContext.Provider value={bucket}>{children}</BucketContext.Provider>;
}

export function useBucket(): string {
  const bucket = useContext(BucketContext);
  if (!bucket) {
    throw new Error("useBucket must be used within a BucketProvider");
  }
  return bucket;
}
