import FlowCard from "../components/FlowCard";
import { Code2, Database, PlugZap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          What is JDBC?
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">
          JDBC (Java Database Connectivity) helps Java programs talk to databases like MySQL.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <FlowCard
          title="JDBC Flow (Visual Pipeline)"
          footer="Next: Go to Setup MySQL to generate JDBC URL and code."
        >
          <div className="grid gap-6">
            {/* Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-3 items-center">
              <Node icon={<Code2 size={18} />} title="Java Program" desc="Runs your Java code" color="blue" />
              <Pipe />
              <Node icon={<PlugZap size={18} />} title="JDBC Driver" desc="Connector between Java & DB" color="slate" />
              <Pipe />
              <Node icon={<Database size={18} />} title="MySQL Server" desc="Stores databases + tables" color="blue2" />
              <Pipe />
              <Node icon={<ArrowRight size={18} />} title="Result" desc="Rows returned to Java" color="green" />
            </div>

            {/* Concepts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Concept title="JDBC API" text="Java methods for database operations (Connection, Statement etc.)" />
              <Concept title="Database URL" text="Location of DB: jdbc:mysql://host:3306/db" />
              <Concept title="SQL Query" text="Commands like SELECT, INSERT, UPDATE, DELETE" />
            </div>
          </div>
        </FlowCard>
      </div>
    </div>
  );
}

function Pipe() {
  return (
    <div className="hidden lg:flex items-center justify-center">
      <div className="h-1 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="h-3 w-3 rounded-full bg-slate-400 dark:bg-slate-500 -ml-1" />
    </div>
  );
}

function Node({ icon, title, desc, color }) {
  const themes = {
    blue: "bg-blue-600 text-white",
    blue2: "bg-blue-500 text-white",
    slate: "bg-slate-900 text-white",
    green: "bg-emerald-600 text-white",
  };

  return (
    <div className={`rounded-2xl p-4 shadow-sm ${themes[color]}`}>
      <div className="flex items-center gap-2 opacity-90">
        {icon}
        <span className="text-xs">NODE</span>
      </div>
      <div className="text-lg font-bold mt-1">{title}</div>
      <div className="text-sm opacity-90 mt-1">{desc}</div>
    </div>
  );
}

function Concept({ title, text }) {
  return (
    <div className="rounded-2xl border p-4 bg-slate-50 dark:bg-slate-950 dark:border-slate-800">
      <div className="font-semibold text-slate-900 dark:text-white">{title}</div>
      <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
        {text}
      </div>
    </div>
  );
}
