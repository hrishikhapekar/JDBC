import { DatabaseZap, Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow">
            <DatabaseZap size={20} />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              JDBC Visualizer
            </div>
            <div className="text-xs text-slate-500">
              Learn Java → MySQL connection visually
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <span className="hidden sm:inline text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 text-slate-600 dark:text-slate-300">
            Phase 1
          </span>
        </div>
      </div>
    </header>
  );
}
