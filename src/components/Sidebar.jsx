import { NavLink } from "react-router-dom";
import {
  Home,
  Settings,
  PlayCircle,
  Code2,
  Terminal,
  TriangleAlert,
} from "lucide-react";

const items = [
  { to: "/", label: "What is JDBC?", icon: Home },
  { to: "/setup", label: "Setup MySQL", icon: Settings },
  { to: "/visualizer", label: "Connection Visualizer", icon: PlayCircle },
  { to: "/code", label: "Generated Code", icon: Code2 },
  { to: "/query", label: "Run SQL Query", icon: Terminal },
  { to: "/errors", label: "Error Troubleshooter", icon: TriangleAlert },
];

export default function Sidebar() {
  return (
    <aside className="rounded-2xl border bg-white shadow-sm p-3 h-fit sticky top-[86px]">
      <div className="text-xs font-semibold text-slate-500 px-2 pb-2">
        MODULES
      </div>

      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl border transition ${
                isActive
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-700"
              }`
            }
          >
            <item.icon size={18} />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
