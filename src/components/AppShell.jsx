import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppShell() {
  return (
    <main className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm min-h-[75vh]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 py-4">
          <Sidebar />
          <main className="rounded-2xl border bg-white shadow-sm min-h-[75vh]">
            <Outlet />
          </main>
        </div>
      </div>
      <footer className="py-6 text-center text-sm text-slate-500">
        JDBC Visualizer • Phase 1 (Pure Frontend)
      </footer>
    </main>
  );
}
