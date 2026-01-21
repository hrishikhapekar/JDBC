import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useFlowSync } from "../context/useFlowSync";
import { motion, AnimatePresence } from "framer-motion";

export default function CodeExplainer({ code = "", explanations = {}, lineToStep = {} }) {
  const [hoverLine, setHoverLine] = useState(null);
  const [clickLine, setClickLine] = useState(null);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationIdsRef = useRef([]);

  // ✅ store pending jump if editor not mounted yet
  const pendingFocusRef = useRef(null);

  const {
    setActiveStep,
    setActiveReason,
    codeFocusLine,
    setCodeFocusLine,
  } = useFlowSync();

  // Tooltip UI
  const [toast, setToast] = useState(null);

  const decoratedCode = useMemo(() => code, [code]);

  // ✅ highlight line in monaco
  const applyLineHighlight = (lineNumber, blink = false) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !lineNumber) return;

    decorationIdsRef.current = editor.deltaDecorations(
      decorationIdsRef.current,
      [
        {
          range: new monaco.Range(lineNumber, 1, lineNumber, 1),
          options: {
            isWholeLine: true,
            className: blink ? "code-line-blink" : "hover-line-highlight",
          },
        },
      ]
    );
  };

  // ✅ core "jump to line" logic
  const focusLine = (lineNumber) => {
    const editor = editorRef.current;
    if (!editor || !lineNumber) return false;

    editor.revealLineInCenter(lineNumber);
    editor.setPosition({ lineNumber, column: 1 });
    editor.focus();

    applyLineHighlight(lineNumber, true); // blink
    setClickLine(lineNumber);

    // tooltip text
    const info = explanations[lineNumber];
    const title = info?.title || "Focused line";
    setToast({
      line: lineNumber,
      title,
      time: Date.now(),
    });

    return true;
  };

  // ✅ When codeFocusLine changes -> jump or queue jump
  useEffect(() => {
    if (!codeFocusLine) return;

    const didFocus = focusLine(codeFocusLine);

    // Monaco not mounted yet -> queue it
    if (!didFocus) {
      pendingFocusRef.current = codeFocusLine;
    }

    // reset focus line in context
    const t = setTimeout(() => setCodeFocusLine(null), 150);
    return () => clearTimeout(t);
  }, [codeFocusLine, setCodeFocusLine]);

  // auto-hide tooltip
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const hoverInfo = hoverLine ? explanations[hoverLine] : null;
  const clickInfo = clickLine ? explanations[clickLine] : null;
  const displayInfo = clickInfo || hoverInfo;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
      {/* Monaco Editor + Toast */}
      <div className="relative rounded-2xl overflow-hidden border dark:border-slate-800">
        {/* Floating Tooltip */}
        <AnimatePresence>
          {toast ? (
            <motion.div
              key={toast.time}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="absolute z-20 top-3 left-3 right-3 sm:right-auto sm:w-[360px]
                        rounded-2xl border bg-white shadow-lg px-4 py-3
                        dark:bg-slate-900 dark:border-slate-800"
            >
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Jumped to line {toast.line}
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">
                {toast.title}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <Editor
          height="460px"
          defaultLanguage="java"
          value={decoratedCode}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            readOnly: true,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorSmoothCaretAnimation: "on",
          }}
          onMount={(editor, monaco) => {
            editorRef.current = editor;
            monacoRef.current = monaco;

            // ✅ if we had a queued jump, run it now
            if (pendingFocusRef.current) {
              const ln = pendingFocusRef.current;
              pendingFocusRef.current = null;
              setTimeout(() => focusLine(ln), 80);
            }

            // hover detection
            editor.onMouseMove((e) => {
              const pos = e.target.position;
              if (!pos) return;
              setHoverLine(pos.lineNumber);
              applyLineHighlight(pos.lineNumber);
            });

            editor.onMouseLeave(() => setHoverLine(null));

            // click line => sync to visualizer
            editor.onMouseDown((e) => {
              const pos = e.target.position;
              if (!pos) return;

              const ln = pos.lineNumber;
              setClickLine(ln);
              applyLineHighlight(ln);

              const step = lineToStep[ln];
              if (typeof step === "number") {
                setActiveStep(step);
                setActiveReason(`Selected from code line ${ln}`);
              }
            });
          }}
        />
      </div>

      {/* Explanation */}
      <div className="rounded-2xl border bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          LINE EXPLANATION
        </div>

        {!displayInfo ? (
          <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Hover a line to read explanation. Click a line to sync with Visualizer.
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="rounded-xl border bg-white p-3 dark:bg-slate-900 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {clickLine ? `Clicked Line ${clickLine}` : `Line ${hoverLine}`}
              </div>
              <div className="font-semibold text-slate-900 dark:text-white mt-1">
                {displayInfo.title}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-3 dark:bg-slate-900 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Meaning</div>
              <div className="text-sm text-slate-700 dark:text-slate-200 mt-1">
                {displayInfo.meaning}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-3 dark:bg-slate-900 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Common Error</div>
              <div className="text-sm text-red-700 mt-1">
                {displayInfo.error}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-3 dark:bg-slate-900 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Fix</div>
              <div className="text-sm text-emerald-700 mt-1">
                {displayInfo.fix}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          ✅ Smooth jump + blink highlight enabled
        </div>
      </div>
    </div>
  );
}
