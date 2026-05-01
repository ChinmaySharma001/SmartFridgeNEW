import { motion, AnimatePresence } from "framer-motion";

interface Props {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, description, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(5,8,16,0.8)] backdrop-blur-lg"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="bg-[#0d1526] border border-[rgba(99,157,255,0.15)] rounded-[24px] p-7 max-w-sm w-[90%]"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
      >
        <h2 className="font-display text-lg font-bold text-[#e8edf8] mb-2.5">{title}</h2>
        <p className="text-[#8a9bbf] text-sm leading-relaxed mb-6">{description}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-[10px] border border-[rgba(99,157,255,0.15)] bg-transparent text-[#8a9bbf] text-sm hover:text-[#e8edf8] hover:border-[rgba(99,157,255,0.3)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-[10px] border border-[rgba(255,77,109,0.3)] bg-[rgba(255,77,109,0.1)] text-[#ff4d6d] text-sm font-medium hover:bg-[rgba(255,77,109,0.18)] transition-all"
          >
            Remove
          </button>
        </div>
      </motion.div>
    </div>
  );
}
