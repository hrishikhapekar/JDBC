import { motion, AnimatePresence } from "framer-motion";

export default function Toast({ show, text }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800"
        >
          <div className="font-semibold">✅ Saved</div>
          <div className="text-sm">{text}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
