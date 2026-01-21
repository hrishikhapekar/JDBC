import { useMemo, useState } from "react";
import FlowCard from "../components/FlowCard";
import Editor from "@monaco-editor/react";
import { loadLocal, saveLocal } from "../utils/helpers";

/* ---------------------------
   DB Structure (Frontend Only)
----------------------------*/

const DEFAULT_DB = {
  tables: {
    students: {
      columns: { id: "int", name: "string", age: "int" },
      autoIncrement: "id",
      nextId: 4,
      rows: [
        { id: 1, name: "Alice", age: 20 },
        { id: 2, name: "Bob", age: 22 },
        { id: 3, name: "Charlie", age: 19 },
      ],
    },
  },
};

/* ---------------------------
          Helpers
----------------------------*/

function normalizeSQL(sql) {
  return sql.trim().replace(/\s+/g, " ");
}

function stripQuotes(v) {
  return v.replace(/^['"]|['"]$/g, "");
}

function toValue(raw) {
  let v = raw.trim();
  v = stripQuotes(v);
  if (v.toLowerCase() === "null") return null;
  if (!isNaN(v) && v !== "") return Number(v);
  return v;
}

/** Split SQL statements by ';' safely (simple approach) */
function splitStatements(sql) {
  const clean = sql.trim();
  if (!clean) return [];

  // split by semicolon and remove empty
  return clean
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s + ";");
}

/* ---------------------------
     WHERE (AND / OR) Parser
----------------------------*/
/**
 * Supported:
 * WHERE id=1
 * WHERE id=1 AND age=20
 * WHERE id=1 OR name="Alice"
 * WHERE id=1 AND name="Bob" OR age=20 (evaluated left to right)
 */
function parseWhere(whereRaw) {
  if (!whereRaw) return null;

  const tokens = whereRaw
    .trim()
    .split(/\s+(AND|OR)\s+/i)
    .map((t) => t.trim())
    .filter(Boolean);

  // tokens becomes: [cond1, AND/OR, cond2, AND/OR, cond3...]
  const parts = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (/^(AND|OR)$/i.test(t)) {
      parts.push({ op: t.toUpperCase() });
    } else {
      const m = t.match(/^(\w+)\s*=\s*(.+)$/);
      if (!m) return { error: "Invalid WHERE clause. Use col=value with AND/OR." };

      parts.push({
        type: "cond",
        col: m[1],
        value: toValue(m[2]),
      });
    }
  }

  return { parts };
}

function whereMatches(row, whereObj) {
  if (!whereObj) return true;
  if (whereObj.error) return false;

  // Evaluate left to right
  let result = null;
  let pendingOp = null;

  for (const part of whereObj.parts) {
    if (part.op) {
      pendingOp = part.op;
      continue;
    }

    const condValue = row[part.col] === part.value;

    if (result === null) result = condValue;
    else if (pendingOp === "AND") result = result && condValue;
    else if (pendingOp === "OR") result = result || condValue;
    else result = condValue;

    pendingOp = null;
  }

  return Boolean(result);
}

/* ---------------------------
      SQL Engine Core
----------------------------*/

function getTable(db, table) {
  return db.tables?.[table];
}

function ensureTable(db, table) {
  const t = getTable(db, table);
  if (!t) return { ok: false, error: `Unknown table '${table}'` };
  return { ok: true, table: t };
}

function parseColumnsList(colsRaw) {
  return colsRaw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

function parseValuesList(valuesRaw) {
  // simple split by comma
  return valuesRaw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function validateColumnsExist(tableObj, cols) {
  for (const c of cols) {
    if (!(c in tableObj.columns)) {
      return { ok: false, error: `Unknown column '${c}'` };
    }
  }
  return { ok: true };
}

function runOneStatement(db, sqlRaw) {
  const sql = normalizeSQL(sqlRaw);

  if (!sql.endsWith(";")) {
    return { ok: false, error: "SQL must end with semicolon ;" };
  }

  const query = sql.slice(0, -1).trim();

  /* ✅ CREATE TABLE simulation
     CREATE TABLE teachers (id INT AUTO_INCREMENT, name VARCHAR, subject VARCHAR);
  */
  const createMatch = query.match(/^CREATE\s+TABLE\s+(\w+)\s*\((.+)\)$/i);
  if (createMatch) {
    const tableName = createMatch[1].trim();
    const colsRaw = createMatch[2].trim();

    if (db.tables[tableName])
      return { ok: false, error: `Table '${tableName}' already exists.` };

    const colDefs = colsRaw.split(",").map((x) => x.trim()).filter(Boolean);

    const columns = {};
    let autoIncCol = null;

    for (const def of colDefs) {
      // ex: id INT AUTO_INCREMENT
      // ex: name VARCHAR
      const parts = def.split(/\s+/).map((p) => p.trim());
      const col = parts[0];
      const type = (parts[1] || "string").toLowerCase();
      const isAuto = parts.join(" ").toUpperCase().includes("AUTO_INCREMENT");

      columns[col] = type.includes("int") ? "int" : "string";

      if (isAuto) autoIncCol = col;
    }

    db.tables[tableName] = {
      columns,
      autoIncrement: autoIncCol,
      nextId: 1,
      rows: [],
    };

    return { ok: true, type: "create", message: `Table '${tableName}' created` };
  }

  /* ✅ SELECT
     SELECT * FROM students;
     SELECT id,name FROM students WHERE id=1 AND age=20;
  */
  const selectMatch = query.match(
    /^SELECT\s+(.+)\s+FROM\s+(\w+)(\s+WHERE\s+(.+))?$/i
  );
  if (selectMatch) {
    const colsRaw = selectMatch[1].trim();
    const tableName = selectMatch[2].trim();
    const whereRaw = selectMatch[4]?.trim();

    const tableCheck = ensureTable(db, tableName);
    if (!tableCheck.ok) return tableCheck;

    const table = tableCheck.table;

    const whereObj = parseWhere(whereRaw);
    if (whereObj?.error) return { ok: false, error: whereObj.error };

    let rows = table.rows.filter((r) => whereMatches(r, whereObj));

    // column selection
    if (colsRaw !== "*") {
      const cols = parseColumnsList(colsRaw);
      const val = validateColumnsExist(table, cols);
      if (!val.ok) return val;

      rows = rows.map((r) => {
        const obj = {};
        cols.forEach((c) => (obj[c] = r[c]));
        return obj;
      });
    }

    return { ok: true, type: "select", rows, message: `${rows.length} row(s)` };
  }

  /* ✅ INSERT
     INSERT INTO students (name,age) VALUES ("David",21);
     INSERT INTO students (id,name,age) VALUES (4,"David",21);
  */
  const insertMatch = query.match(
    /^INSERT\s+INTO\s+(\w+)\s*\((.+)\)\s*VALUES\s*\((.+)\)$/i
  );
  if (insertMatch) {
    const tableName = insertMatch[1].trim();
    const cols = parseColumnsList(insertMatch[2]);
    const values = parseValuesList(insertMatch[3]);

    const tableCheck = ensureTable(db, tableName);
    if (!tableCheck.ok) return tableCheck;
    const table = tableCheck.table;

    if (cols.length !== values.length)
      return { ok: false, error: "Columns count must match values count." };

    const colValCheck = validateColumnsExist(table, cols);
    if (!colValCheck.ok) return colValCheck;

    const newRow = {};
    cols.forEach((c, idx) => {
      newRow[c] = toValue(values[idx]);
    });

    // auto increment support
    if (table.autoIncrement) {
      const ai = table.autoIncrement;
      if (!(ai in newRow) || newRow[ai] === null || newRow[ai] === undefined) {
        newRow[ai] = table.nextId++;
      } else {
        // if user manually gives id, update nextId
        if (typeof newRow[ai] === "number" && newRow[ai] >= table.nextId) {
          table.nextId = newRow[ai] + 1;
        }
      }
    }

    // basic primary key duplicate check if id exists
    if ("id" in table.columns && "id" in newRow) {
      const exists = table.rows.some((r) => r.id === newRow.id);
      if (exists) return { ok: false, error: `Duplicate entry for id=${newRow.id}` };
    }

    table.rows.push(newRow);

    return { ok: true, type: "insert", message: "1 row inserted" };
  }

  /* ✅ UPDATE
     UPDATE students SET age=23 WHERE id=2;
     UPDATE students SET name="X",age=21 WHERE id=1 AND age=20;
  */
  const updateMatch = query.match(
    /^UPDATE\s+(\w+)\s+SET\s+(.+?)(\s+WHERE\s+(.+))?$/i
  );
  if (updateMatch) {
    const tableName = updateMatch[1].trim();
    const setRaw = updateMatch[2].trim();
    const whereRaw = updateMatch[4]?.trim();

    const tableCheck = ensureTable(db, tableName);
    if (!tableCheck.ok) return tableCheck;
    const table = tableCheck.table;

    const updates = {};
    const parts = setRaw.split(",").map((p) => p.trim()).filter(Boolean);

    for (const part of parts) {
      const m = part.match(/^(\w+)\s*=\s*(.+)$/);
      if (!m) return { ok: false, error: "Invalid SET clause. Use col=value." };

      const col = m[1];
      const val = toValue(m[2]);

      if (!(col in table.columns))
        return { ok: false, error: `Unknown column '${col}'` };

      updates[col] = val;
    }

    const whereObj = parseWhere(whereRaw);
    if (whereObj?.error) return { ok: false, error: whereObj.error };

    let count = 0;
    table.rows = table.rows.map((r) => {
      if (whereMatches(r, whereObj)) {
        count++;
        return { ...r, ...updates };
      }
      return r;
    });

    return { ok: true, type: "update", message: `${count} row(s) updated` };
  }

  /* ✅ DELETE
     DELETE FROM students WHERE id=3;
     DELETE FROM students WHERE age=20 OR name="Alice";
  */
  const deleteMatch = query.match(/^DELETE\s+FROM\s+(\w+)(\s+WHERE\s+(.+))?$/i);
  if (deleteMatch) {
    const tableName = deleteMatch[1].trim();
    const whereRaw = deleteMatch[3]?.trim();

    const tableCheck = ensureTable(db, tableName);
    if (!tableCheck.ok) return tableCheck;
    const table = tableCheck.table;

    if (!whereRaw)
      return { ok: false, error: "DELETE requires WHERE clause in this simulator." };

    const whereObj = parseWhere(whereRaw);
    if (whereObj?.error) return { ok: false, error: whereObj.error };

    const before = table.rows.length;
    table.rows = table.rows.filter((r) => !whereMatches(r, whereObj));
    const after = table.rows.length;

    return {
      ok: true,
      type: "delete",
      message: `${before - after} row(s) deleted`,
    };
  }

  return {
    ok: false,
    error:
      "Unsupported SQL.\nTry: SELECT / INSERT / UPDATE / DELETE / CREATE TABLE",
  };
}

function runSQL(db, rawSQL) {
  const stmts = splitStatements(rawSQL);

  if (!stmts.length) return { ok: false, error: "Write an SQL query first." };

  const results = [];
  let lastRows = [];

  for (const s of stmts) {
    const res = runOneStatement(db, s);

    results.push(res);

    if (!res.ok) {
      return { ok: false, error: res.error, results };
    }

    if (res.type === "select") lastRows = res.rows || [];
  }

  return {
    ok: true,
    message: `${stmts.length} statement(s) executed successfully`,
    lastRows,
    results,
  };
}

/* ---------------------------
         QueryRunner
----------------------------*/

export default function QueryRunner() {
  const [db, setDb] = useState(() => loadLocal("miniDB2", DEFAULT_DB));
  const [query, setQuery] = useState(
    `SELECT * FROM students;
SELECT name,age FROM students WHERE id=2;`
  );
  const [output, setOutput] = useState(null);

  const persistDB = (newDB) => {
    setDb(newDB);
    saveLocal("miniDB2", newDB);
  };

  const javaPreview = useMemo(() => {
    return `Statement st = con.createStatement();

// Example:
ResultSet rs = st.executeQuery("${query.replaceAll('"', '\\"')}");

while(rs.next()){
    System.out.println(rs.getString(1));
}`;
  }, [query]);

  const activeRows = output?.rows || [];
  const columns = useMemo(() => {
    if (!activeRows.length) return [];
    return Object.keys(activeRows[0]);
  }, [activeRows]);

  function runQuery() {
    const clone = JSON.parse(JSON.stringify(db));
    const res = runSQL(clone, query);

    if (!res.ok) {
      setOutput({ ok: false, error: res.error, rows: [] });
      return;
    }

    persistDB(clone);

    setOutput({
      ok: true,
      message: res.message,
      rows: res.lastRows || [],
      results: res.results,
    });
  }

  function resetDB() {
    persistDB(DEFAULT_DB);
    setOutput({ ok: true, message: "Database reset to default", rows: [] });
  }

  const tableNames = Object.keys(db.tables || {});

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Run SQL Query (In-Browser SQL Engine)
      </h1>
      <p className="text-slate-600 dark:text-slate-300 mt-1">
        Supports multiple tables, AND/OR WHERE, auto-increment, CREATE TABLE.
      </p>

      <div className="mt-6 space-y-4">
        <FlowCard
          title="SQL Playground"
          right={
            <button
              onClick={resetDB}
              className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-white"
            >
              Reset DB
            </button>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Java preview */}
            <Block title="Java Code (Preview)">
              <Editor
                height="300px"
                defaultLanguage="java"
                value={javaPreview}
                options={{ fontSize: 13, minimap: { enabled: false }, readOnly: true }}
              />
            </Block>

            {/* SQL input */}
            <Block title="SQL Query (multiple statements allowed)">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-[300px] p-3 rounded-xl border font-mono text-sm outline-none focus:ring-2 focus:ring-blue-200 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              />

              <div className="mt-3 flex gap-2 flex-wrap">
                <button
                  onClick={runQuery}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700"
                >
                  Run Query
                </button>

                <button
                  onClick={() =>
                    setQuery(
                      `CREATE TABLE teachers (id INT AUTO_INCREMENT, name VARCHAR, subject VARCHAR);
INSERT INTO teachers (name,subject) VALUES ("Ravi","DBMS");
SELECT * FROM teachers;`
                    )
                  }
                  className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-white"
                >
                  Example CREATE TABLE
                </button>
              </div>
            </Block>

            {/* Results */}
            <Block title="Query Results">
              {!output ? (
                <EmptyBox text="Run query to see output" />
              ) : output.ok ? (
                <div className="space-y-3">
                  <div className="rounded-xl border bg-emerald-50 border-emerald-200 p-3 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-300">
                    <div className="font-semibold">✅ Success</div>
                    <div className="text-sm">{output.message}</div>
                  </div>

                  {activeRows.length ? (
                    <div className="overflow-hidden rounded-xl border dark:border-slate-800">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950">
                          <tr>
                            {columns.map((c) => (
                              <th
                                key={c}
                                className="p-2 border-b text-left dark:border-slate-800 dark:text-slate-200"
                              >
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {activeRows.map((row, idx) => (
                            <tr key={idx}>
                              {columns.map((c) => (
                                <td
                                  key={c}
                                  className="p-2 border-b dark:border-slate-800 dark:text-slate-200"
                                >
                                  {String(row[c])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyBox text="No table output for last statement." />
                  )}
                </div>
              ) : (
                <div className="rounded-xl border bg-red-50 border-red-200 p-3 text-red-800 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-300">
                  <div className="font-semibold">❌ SQL Error</div>
                  <div className="text-sm mt-1 whitespace-pre-wrap">{output.error}</div>
                </div>
              )}
            </Block>
          </div>

          {/* DB Tables */}
          <div className="mt-6 rounded-2xl border bg-slate-50 p-4 dark:bg-slate-950 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              DATABASE TABLES
            </div>
            <div className="mt-2 flex gap-2 flex-wrap">
              {tableNames.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full border bg-white text-sm dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                >
                  {t} ({db.tables[t].rows.length} rows)
                </span>
              ))}
            </div>
          </div>
        </FlowCard>
      </div>
    </div>
  );
}

/* ---------------------------
        UI Helpers
----------------------------*/

function Block({ title, children }) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div className="h-[300px] rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
      {text}
    </div>
  );
}
