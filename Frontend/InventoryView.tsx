import { useState } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw } from "lucide-react";
import { useInventory } from "./useInventory";
import { daysLeft } from "./expiry";
import ItemCard from "./ItemCard";
import { FridgeItem } from "./api";

interface Props { onNav: (tab: string) => void; }

function SkeletonCard() {
  return (
    <div className="rounded-[20px] overflow-hidden border border-[rgba(99,157,255,0.08)] bg-[rgba(13,21,38,0.5)]">
      <div className="skeleton h-32 w-full" />
      <div className="p-3.5">
        <div className="skeleton h-4 w-3/4 mb-3 rounded" />
        <div className="flex gap-2 mb-3">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-20 rounded-lg ml-auto" />
        </div>
        <div className="skeleton h-6 w-7 rounded-lg ml-auto" />
      </div>
    </div>
  );
}

export default function InventoryView({ onNav }: Props) {
  const { items, loading, offline, load, sort, changeSort, updateQty, updateExpiry, removeItem } = useInventory();
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const doRefresh = async () => {
    setRefreshing(true);
    await load(sort);
    setRefreshing(false);
  };

  const filtered = items.filter((i: FridgeItem) =>
    (i.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const fresh = items.filter((i: FridgeItem) => (daysLeft(i.expiryDate) ?? 99) > 5).length;
  const warn = items.filter((i: FridgeItem) => { const d = daysLeft(i.expiryDate); return d !== null && d > 0 && d <= 5; }).length;
  const expired = items.filter((i: FridgeItem) => { const d = daysLeft(i.expiryDate); return d !== null && d <= 0; }).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-tight">
            Your Fridge <span className="text-[#00e5a0]">❄</span>
          </h1>
          {offline && (
            <p className="text-xs text-[#f59e0b] mt-1">⚡ Demo mode — connect your backend to sync</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2.5 flex-wrap items-center">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5878]" />
            <input
              className="pl-9 pr-3 py-2 text-sm rounded-[10px] bg-[rgba(13,21,38,0.6)] border border-[rgba(99,157,255,0.12)] text-[#e8edf8] placeholder-[#4a5878] focus:outline-none focus:border-[rgba(99,157,255,0.3)] w-52 transition-colors"
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => changeSort(e.target.value)}
            className="px-3 py-2 text-sm rounded-[10px] bg-[rgba(13,21,38,0.6)] border border-[rgba(99,157,255,0.12)] text-[#8a9bbf] focus:outline-none cursor-pointer"
          >
            <option value="expiry">Expiry (Soonest)</option>
            <option value="name">Name (A–Z)</option>
            <option value="createdAt">Recently Added</option>
          </select>
          <button
            onClick={doRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-[10px] bg-[rgba(13,21,38,0.6)] border border-[rgba(99,157,255,0.12)] text-[#8a9bbf] hover:text-[#639dff] hover:border-[rgba(99,157,255,0.3)] transition-colors"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-3 mb-6 flex-wrap"
        >
          {[
            { val: fresh, label: "Fresh", color: "#00e5a0" },
            { val: warn, label: "Expiring Soon", color: "#f59e0b" },
            { val: expired, label: "Expired", color: "#ff4d6d" },
            { val: items.length, label: "Total Items", color: "#639dff" },
          ].map(({ val, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[rgba(13,21,38,0.6)] border border-[rgba(99,157,255,0.1)] text-sm"
            >
              <span className="font-display text-base font-bold" style={{ color }}>{val}</span>
              <span className="text-[#8a9bbf]">{label}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center text-center py-20 gap-4">
          <div
            className="w-24 h-24 rounded-[24px] bg-[rgba(99,157,255,0.05)] border border-[rgba(99,157,255,0.1)] flex items-center justify-center text-5xl"
            style={{ animation: "float 3s ease-in-out infinite" }}
          >
            🧊
          </div>
          <h2 className="font-display text-xl font-bold">{search ? "No items found" : "Your fridge is empty"}</h2>
          <p className="text-[#8a9bbf] text-sm max-w-xs leading-relaxed">
            {search ? "Try a different search term." : "Scan your groceries to start tracking expiry dates and reducing food waste."}
          </p>
          {!search && (
            <button
              onClick={() => onNav("scan")}
              className="mt-2 px-6 py-2.5 rounded-[11px] text-sm font-semibold text-[#020d08] bg-gradient-to-br from-[#00e5a0] to-[rgba(0,180,120,0.9)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,229,160,0.35)] transition-all"
            >
              Scan Your First Item →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {filtered.map((item: FridgeItem, i: number) => (
            <ItemCard
              key={item.id}
              item={item}
              index={i}
              onUpdateQty={updateQty}
              onUpdateExpiry={updateExpiry}
              onDelete={removeItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
