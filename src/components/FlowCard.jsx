export default function FlowCard({ title, children, footer, right }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
      {/* header */}
      <div className="px-5 py-4 border-b flex items-center justify-between gap-3 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>

        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      {/* body */}
      <div className="p-5">{children}</div>

      {/* footer */}
      {footer ? (
        <div className="px-5 py-4 border-t bg-slate-50 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
