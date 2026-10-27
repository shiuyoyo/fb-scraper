// Re-export the shape the registry needs without pulling in external-data,
// which would create a package cycle (external-data → templates → external-data).
export type EventLive = {
  status?: string;
  registered?: number;
  capacity?: number;
  notice?: string;
  sourceStatus: "disabled" | "ok" | "empty" | "failed";
  error?: string;
};
