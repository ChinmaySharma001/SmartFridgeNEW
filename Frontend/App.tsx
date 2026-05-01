import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Refrigerator, Camera, ChefHat } from "lucide-react";
import { Toaster } from "react-hot-toast";
import InventoryView from "./InventoryView";
import ScannerView from "./ScannerView";
import ChefView from "./ChefView";

type Tab = "inventory" | "scan" | "chef";

const TABS = [
  { id: "inventory" as Tab, label: "Inventory", icon: Refrigerator },
  { id: "scan" as Tab, label: "Scan Item", icon: Camera },
  { id: "chef" as Tab, label: "Zero-Waste Chef", icon: ChefHat },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("inventory");

  return (
    <div className="min-h-screen bg-[#050810] text-[#e8edf8] font-body relative">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-48 -right-24 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(99,157,255,0.07) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-36 -left-24 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(0,229,160,0.05) 0%, transparent 70%)" }} />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,77,109,0.04) 0%, transparent 70%)" }} />
      </div>

      {/* Topbar */}
      <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 border-b border-[rgba(99,157,255,0.1)]" style={{ background: "rgba(5,8,16,0.8)", backdropFilter: "blur(30px)" }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-base" style={{ background: "linear-gradient(135deg, #00e5a0, #639dff)" }}>
            ❄
          </div>
          <span className="font-display text-[18px] font-bold tracking-tight" style={{ background: "linear-gradient(90deg, #00e5a0, #639dff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            SmartFridge
          </span>
        </div>

        {/* Desktop tabs */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-[12px] bg-[rgba(13,21,38,0.7)] border border-[rgba(99,157,255,0.1)]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] text-[13px] font-medium transition-all ${
                tab === t.id
                  ? "bg-[rgba(99,157,255,0.15)] text-[#639dff] border border-[rgba(99,157,255,0.2)]"
                  : "text-[#8a9bbf] hover:text-[#e8edf8] hover:bg-[rgba(99,157,255,0.06)] border border-transparent"
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-[1200px] mx-auto px-6 py-7 pb-24 md:pb-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {tab === "inventory" && <InventoryView onNav={(t) => setTab(t as Tab)} />}
            {tab === "scan" && <ScannerView onNav={(t) => setTab(t as Tab)} />}
            {tab === "chef" && <ChefView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around px-4 pt-2 pb-5 border-t border-[rgba(99,157,255,0.1)]" style={{ background: "rgba(5,8,16,0.93)", backdropFilter: "blur(30px)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-[10px] transition-all ${
              tab === t.id ? "text-[#00e5a0]" : "text-[#4a5878]"
            }`}
          >
            <t.icon size={20} />
            <span className="text-[10px] font-medium">{t.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(13,21,38,0.95)",
            border: "1px solid rgba(99,157,255,0.2)",
            color: "#e8edf8",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "13px",
            backdropFilter: "blur(20px)",
            borderRadius: "12px",
          },
          success: { iconTheme: { primary: "#00e5a0", secondary: "#020d08" } },
          error: { iconTheme: { primary: "#ff4d6d", secondary: "#020d08" } },
        }}
      />
    </div>
  );
}
