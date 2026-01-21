import FlowCard from "../components/FlowCard";
import Stepper from "../components/Stepper";
import AnimatedFlow from "../components/AnimatedFlow";
import { useFlowSync } from "../context/useFlowSync";
import { stepToLine } from "../utils/stepToLine";
import { useNavigate } from "react-router-dom";

const steps = ["Java Program", "JDBC Driver", "MySQL Server", "Database Result"];

export default function Visualizer() {
  const navigate = useNavigate();

  const {
    activeStep,
    setActiveStep,
    activeReason,
    setActiveReason,
    setCodeFocusLine,
  } = useFlowSync();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        JDBC Connection Visualizer
      </h1>

      <p className="text-slate-600 dark:text-slate-300 mt-1">
        Click a node to jump directly to the related code line.
      </p>

      <div className="mt-6">
        <FlowCard title="Animated Connection Flow (Synced With Code)">
          <Stepper steps={steps} active={activeStep} />

          <div className="mt-6">
            <AnimatedFlow
              activeIndex={activeStep}
              nodes={steps}
              onNodeClick={(idx) => {
                setActiveStep(idx);
                setActiveReason(`Selected from node click: ${steps[idx]}`);

                const ln = stepToLine[idx];
                if (ln) {
                  setCodeFocusLine(ln);

                  // ✅ this is what makes it actually "jump"
                  navigate("/code");
                }
              }}
            />
          </div>

          <div className="mt-5 rounded-2xl border bg-slate-50 p-4 dark:bg-slate-950 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              SYNC STATUS
            </div>

            <div className="font-semibold text-slate-900 dark:text-white">
              Highlighted: {steps[activeStep]}
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {activeReason || "No selection yet. Click code line or node."}
            </div>
          </div>
        </FlowCard>
      </div>
    </div>
  );
}
