import { motion } from "framer-motion";

/**
 * AnimatedFlow
 * - Shows 4 nodes
 * - Animated flow arrows behind nodes
 * - Click node -> triggers onNodeClick(stepIndex)
 */
export default function AnimatedFlow({
  activeIndex = 0,
  nodes = [],
  onNodeClick,
}) {
  return (
    <div className="relative">
      {/* Animated arrows behind nodes (desktop only) */}
      <div className="hidden lg:block absolute inset-0 -z-10 pointer-events-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 220"
          preserveAspectRatio="none"
        >
          <Arrow
            d="M 190 95 C 330 95, 340 95, 480 95"
            active={activeIndex >= 0}
          />
          <Arrow
            d="M 490 95 C 630 95, 640 95, 780 95"
            active={activeIndex >= 1}
          />
          <Arrow
            d="M 790 95 C 930 95, 940 95, 1080 95"
            active={activeIndex >= 2}
          />
        </svg>
      </div>

      {/* Nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {nodes.map((n, idx) => (
          <Node
            key={n}
            title={n}
            active={idx === activeIndex}
            onClick={() => onNodeClick?.(idx)}
          />
        ))}
      </div>
    </div>
  );
}

function Node({ title, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-left w-full rounded-2xl border p-4 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 ${
        active
          ? "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800"
          : "bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800"
      }`}
    >
      <div className="text-xs text-slate-500 dark:text-slate-400">NODE</div>

      <div className="font-semibold text-slate-900 dark:text-white">
        {title}
      </div>

      <div className="text-sm mt-1 flex items-center gap-2">
        <span
          className={`inline-flex h-2.5 w-2.5 rounded-full ${
            active ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
          }`}
        />
        <span className="text-slate-600 dark:text-slate-300">
          {active ? "active" : "waiting"}
        </span>
      </div>

      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Click to jump to code line
      </div>
    </button>
  );
}

function Arrow({ d, active }) {
  return (
    <>
      {/* base */}
      <path
        d={d}
        fill="none"
        stroke="rgba(148,163,184,0.35)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* animated */}
      {active ? (
        <motion.path
          d={d}
          fill="none"
          stroke="rgba(37,99,235,0.92)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="18 12"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          style={{
            filter: "drop-shadow(0px 0px 6px rgba(37,99,235,0.45))",
          }}
        />
      ) : null}

      {/* arrow head (fixed at end of each path) */}
      <circle cx="1080" cy="95" r="5.5" fill="rgba(37,99,235,0.9)" />
    </>
  );
}
