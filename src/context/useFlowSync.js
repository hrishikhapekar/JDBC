import { useContext } from "react";
import { FlowSyncContext } from "./FlowSync.context";

export function useFlowSync() {
  const ctx = useContext(FlowSyncContext);
  if (!ctx) {
    throw new Error("useFlowSync must be used inside FlowSyncProvider");
  }
  return ctx;
}
