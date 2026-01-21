import { useState } from "react";
import FlowCard from "../components/FlowCard";

const errors = [
  {
    id: 1,
    title: "Access denied for user 'root'",
    cause: "Wrong username/password.",
    fix: "Check MySQL username & password. Try logging in MySQL CLI first.",
  },
  {
    id: 2,
    title: "Unknown database 'testdb'",
    cause: "Database doesn't exist.",
    fix: "Create database: CREATE DATABASE testdb;",
  },
  {
    id: 3,
    title: "Communications link failure",
    cause: "MySQL server is not running / wrong port.",
    fix: "Start MySQL service + verify port 3306 in MySQL settings.",
  },
];

export default function Troubleshooter() {
  const [selected, setSelected] = useState(errors[0]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900">Error Troubleshooter</h1>
      <p className="text-slate-600 mt-1">
        Understand common JDBC errors + how to fix them.
      </p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        <FlowCard title="Common Errors">
          <div className="grid gap-2">
            {errors.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className={`text-left p-3 rounded-xl border transition ${
                  selected.id === e.id
                    ? "bg-red-50 border-red-200"
                    : "bg-white hover:bg-slate-50 border-slate-200"
                }`}
              >
                <div className="font-semibold text-slate-900">{e.title}</div>
                <div className="text-xs text-slate-500">Click to view fix</div>
              </button>
            ))}
          </div>
        </FlowCard>

        <FlowCard title="Error Explanation & Fix">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="font-semibold text-red-700">
              Error: {selected.title}
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Cause</div>
              <div className="font-semibold text-slate-900 mt-1">
                {selected.cause}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <div className="text-xs text-slate-500">Solution</div>
              <div className="font-semibold text-slate-900 mt-1">
                {selected.fix}
              </div>
            </div>

            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 w-fit">
              Fix the Error
            </button>
          </div>
        </FlowCard>
      </div>
    </div>
  );
}
