import { Check } from "lucide-react";

/**
 * Premium SaaS stepper
 * - Shows progress bar
 * - Completed steps = checkmark
 * - Active step = highlighted card
 * - Pending = muted
 */
export default function Stepper({ steps = [], active = 0 }) {
  const total = Math.max(steps.length, 1);
  const progress = Math.min(((active + 1) / total) * 100, 100);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((label, idx) => {
          const isActive = idx === active;
          const isDone = idx < active;

          return (
            <div
              key={label}
              className={`rounded-2xl border p-4 transition-all duration-300 shadow-sm ${
                isActive
                  ? "bg-blue-50 border-blue-200 ring-2 ring-blue-100 dark:bg-blue-950/40 dark:border-blue-800 dark:ring-blue-900/30"
                  : isDone
                  ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/25 dark:border-emerald-900/50"
                  : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
              }`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Step {idx + 1}
                </div>

                {isDone ? (
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-emerald-600 text-white shadow">
                    <Check size={16} />
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center justify-center h-7 w-7 rounded-full border text-xs font-semibold ${
                      isActive
                        ? "border-blue-300 text-blue-700 bg-white dark:bg-slate-900 dark:border-blue-800 dark:text-blue-300"
                        : "border-slate-200 text-slate-500 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {idx + 1}
                  </span>
                )}
              </div>

              {/* Title */}
              <div
                className={`mt-2 font-semibold ${
                  isActive
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-800 dark:text-slate-200"
                }`}
              >
                {label}
              </div>

              {/* Subtitle */}
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {isDone
                  ? "Completed"
                  : isActive
                  ? "Currently active"
                  : "Pending"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
