import { useMemo, useState } from "react";
import FlowCard from "../components/FlowCard";
import { loadLocal } from "../utils/helpers";
import { makeJavaCode } from "../utils/jdbcTemplates";
import CodeExplainer from "../components/CodeExplainer";
import { javaLineExplanations } from "../utils/lineExplanations";
import { lineToStep } from "../utils/lineToStep";
import { downloadMavenZip, downloadTextFile } from "../utils/downloaders";

export default function CodeGenerator() {
  const jdbc = loadLocal("jdbcForm", {
    host: "localhost",
    port: "3306",
    database: "testdb",
    username: "root",
    password: "",
  });

  const code = useMemo(() => makeJavaCode(jdbc), [jdbc]);

  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Generated Java Code
      </h1>

      <p className="text-slate-600 dark:text-slate-300 mt-1">
        Hover a line to understand it. Click a line to sync with Visualizer.
      </p>

      <div className="mt-6">
        <FlowCard title="JDBC Java Program (Hover + Click Explainer)">
          {/* Code Explorer */}
          <CodeExplainer
            code={code}
            explanations={javaLineExplanations}
            lineToStep={lineToStep}
          />

          {/* Action Buttons */}
          <div className="mt-4 flex gap-3 flex-wrap">
            {/* Copy code */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700"
            >
              {copied ? "Copied ✅" : "Copy Full Code"}
            </button>

            {/* Download .java */}
            <button
              onClick={() => downloadTextFile("Main.java", code)}
              className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-white"
            >
              Download Main.java
            </button>

            {/* Download Maven ZIP */}
            <button
              disabled={downloadingZip}
              onClick={async () => {
                try {
                  setDownloadingZip(true);
                  await downloadMavenZip({
                    javaCode: code,
                    artifactId: "jdbc-demo",
                  });
                } finally {
                  setDownloadingZip(false);
                }
              }}
              className={`px-4 py-2 rounded-xl border bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-white ${
                downloadingZip ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {downloadingZip ? "Preparing ZIP..." : "Download Maven ZIP"}
            </button>
          </div>

          {/* Small help text */}
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            📌 Maven ZIP includes: <b>pom.xml</b>, <b>Main.java</b> and a README.
          </div>
        </FlowCard>
      </div>
    </div>
  );
}
