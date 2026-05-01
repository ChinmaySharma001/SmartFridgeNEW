import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { FridgeItem } from "./api";
import { daysLeft, expiryBadge, itemEmoji, capitalize, formatExpiryDate } from "./expiry";
import ConfirmDialog from "./ConfirmDialog";

interface Props {
  item: FridgeItem;
  index: number;
  onUpdateQty: (id: number | string, qty: number) => void;
  onUpdateExpiry: (id: number | string, expiryDate?: string) => void;
  onDelete: (id: number | string) => void;
}

export default function ItemCard({ item, index, onUpdateQty, onUpdateExpiry, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [editingExpiry, setEditingExpiry] = useState(false);
  const [expiryInput, setExpiryInput] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const days = daysLeft(item.expiryDate);
  const { cls, label } = expiryBadge(days);

  const badgeStyles: Record<string, string> = {
    "badge-fresh": "bg-[rgba(0,229,160,0.1)] text-[#00e5a0] border border-[rgba(0,229,160,0.25)]",
    "badge-warn": "bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.25)]",
    "badge-critical": "bg-[rgba(255,77,109,0.1)] text-[#ff4d6d] border border-[rgba(255,77,109,0.25)]",
  };

  const dotStyles: Record<string, string> = {
    "badge-fresh": "bg-[#00e5a0] shadow-[0_0_6px_rgba(0,229,160,0.5)]",
    "badge-warn": "bg-[#f59e0b]",
    "badge-critical": "bg-[#ff4d6d] shadow-[0_0_6px_rgba(255,77,109,0.5)] animate-pulse",
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.06, ease: [0.4, 0, 0.2, 1] }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="rounded-[20px] overflow-hidden border border-[rgba(99,157,255,0.12)] bg-[rgba(13,21,38,0.6)] backdrop-blur-xl hover:border-[rgba(99,157,255,0.25)] hover:bg-[rgba(20,32,58,0.7)] transition-colors"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
      >
        {/* Image */}
        {item.imageUrl && !imgError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-32 object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-32 flex items-center justify-center text-4xl bg-gradient-to-br from-[#0d1526] to-[#080d1a] border-b border-[rgba(99,157,255,0.08)]">
            {itemEmoji(item.name)}
          </div>
        )}

        {/* Body */}
        <div className="p-3.5">
          <div className="font-display text-[15px] font-semibold mb-2.5 truncate tracking-tight text-[#e8edf8]">
            {capitalize(item.name)}
          </div>

          {/* Badge + Qty */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${badgeStyles[cls]}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotStyles[cls]}`} />
              {label}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                className="w-6 h-6 rounded-[7px] flex items-center justify-center border border-[rgba(99,157,255,0.15)] bg-[rgba(99,157,255,0.06)] text-[#639dff] text-base hover:bg-[rgba(99,157,255,0.14)] transition-colors"
              >
                −
              </button>
              <span className="text-sm font-medium min-w-[20px] text-center text-[#e8edf8]">{item.quantity}</span>
              <button
                onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                className="w-6 h-6 rounded-[7px] flex items-center justify-center border border-[rgba(99,157,255,0.15)] bg-[rgba(99,157,255,0.06)] text-[#639dff] text-base hover:bg-[rgba(99,157,255,0.14)] transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 -mt-1 mb-3">
            {!editingExpiry ? (
              <div className="text-xs text-[#4a5878] truncate">
                {formatExpiryDate(item.expiryDate)}
              </div>
            ) : (
              <input
                type="date"
                value={expiryInput}
                min={today}
                onChange={(e) => setExpiryInput(e.target.value)}
                onBlur={() => {
                  setEditingExpiry(false);
                  onUpdateExpiry(item.id, expiryInput || undefined);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setEditingExpiry(false);
                    onUpdateExpiry(item.id, expiryInput || undefined);
                  }
                  if (e.key === "Escape") {
                    setEditingExpiry(false);
                    setExpiryInput(item.expiryDate ? item.expiryDate.slice(0, 10) : "");
                  }
                }}
                className="flex-1 text-xs px-2 py-1 rounded-[8px] bg-[rgba(13,21,38,0.6)] border border-[rgba(99,157,255,0.12)] text-[#e8edf8] focus:outline-none focus:border-[rgba(99,157,255,0.3)]"
              />
            )}
            <button
              onClick={() => {
                const initial = item.expiryDate ? item.expiryDate.slice(0, 10) : "";
                setExpiryInput(initial);
                setEditingExpiry(true);
              }}
              className="w-7 h-7 rounded-[7px] flex items-center justify-center border border-[rgba(99,157,255,0.15)] bg-[rgba(99,157,255,0.06)] text-[#639dff] hover:bg-[rgba(99,157,255,0.14)] transition-colors"
              aria-label="Edit expiry date"
            >
              <Pencil size={12} />
            </button>
          </div>

          {/* Delete */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setConfirming(true)}
              className="w-7 h-7 rounded-[7px] flex items-center justify-center border border-[rgba(255,77,109,0.15)] bg-[rgba(255,77,109,0.06)] text-[rgba(255,77,109,0.5)] hover:bg-[rgba(255,77,109,0.15)] hover:text-[#ff4d6d] hover:border-[rgba(255,77,109,0.3)] transition-all"
            >
              <Trash2 size={12} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {confirming && (
        <ConfirmDialog
          title="Remove item?"
          description={`Remove "${capitalize(item.name)}" from your fridge?`}
          onConfirm={() => { setConfirming(false); onDelete(item.id); }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}
