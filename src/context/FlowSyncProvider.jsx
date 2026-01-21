import { useMemo, useState } from "react";
import { FlowSyncContext } from "./FlowSync.context";

export function FlowSyncProvider({ children }) {
  const [activeStep, setActiveStep] = useState(0);
  const [activeReason, setActiveReason] = useState("");
  const [codeFocusLine, setCodeFocusLine] = useState(null);

  const value = useMemo(
    () => ({
      activeStep,
      setActiveStep,
      activeReason,
      setActiveReason,
      codeFocusLine,
      setCodeFocusLine,
    }),
    [activeStep, activeReason, codeFocusLine]
  );

  return (
    <FlowSyncContext.Provider value={value}>
      {children}
    </FlowSyncContext.Provider>
  );
}
