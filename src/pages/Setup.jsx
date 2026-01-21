import { useEffect, useMemo, useState } from "react";
import FlowCard from "../components/FlowCard";
import Toast from "../components/Toast";
import { buildJdbcUrl, loadLocal, saveLocal } from "../utils/helpers";

export default function Setup() {
  const [savedToast, setSavedToast] = useState(false);

  const [form, setForm] = useState(() =>
    loadLocal("jdbcForm", {
      host: "localhost",
      port: "3306",
      database: "testdb",
      username: "root",
      password: "",
    })
  );

  const jdbcUrl = useMemo(() => buildJdbcUrl(form), [form]);

  useEffect(() => {
    saveLocal("jdbcForm", form);
  }, [form]);

  function handleSubmit(e) {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Setup MySQL Connection
      </h1>
      <p className="text-slate-600 mt-1">
        Fill your MySQL details and generate JDBC URL.
      </p>

      <div className="mt-6">
        <Toast show={savedToast} text="MySQL connection settings stored locally." />
        <FlowCard title="Connection Details">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Host"
                value={form.host}
                onChange={(v) => setForm({ ...form, host: v })}
              />
              <Input
                label="Port"
                value={form.port}
                onChange={(v) => setForm({ ...form, port: v })}
              />
              <Input
                label="Database Name"
                value={form.database}
                onChange={(v) => setForm({ ...form, database: v })}
              />
              <Input
                label="Username"
                value={form.username}
                onChange={(v) => setForm({ ...form, username: v })}
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
              />
            </div>

            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-xs text-slate-500">JDBC URL</div>
              <div className="font-mono text-sm mt-1">{jdbcUrl}</div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700">
                Save / Generate
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(jdbcUrl);
                  setSavedToast(true);
                  setTimeout(() => setSavedToast(false), 1200);
                }}
                className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-50"
              >
                Copy JDBC URL
              </button>
            </div>
          </form>
        </FlowCard>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-blue-200"
      />
    </label>
  );
}
