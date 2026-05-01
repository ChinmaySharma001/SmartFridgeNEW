import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FridgeItem, fetchItems, updateItemQty, deleteItem, updateItem } from "./api";

// Demo data shown when backend is offline
const DEMO_ITEMS: FridgeItem[] = [
  { id: 1, name: "Organic Milk", quantity: 2, expiryDate: new Date(Date.now() + 86400000 * 2).toISOString() },
  { id: 2, name: "Free-Range Eggs", quantity: 6, expiryDate: new Date(Date.now() + 86400000 * 8).toISOString() },
  { id: 3, name: "Sourdough Bread", quantity: 1, expiryDate: new Date(Date.now() + 86400000 * 1).toISOString() },
  { id: 4, name: "Greek Yogurt", quantity: 3, expiryDate: new Date(Date.now() + 86400000 * 5).toISOString() },
  { id: 5, name: "Cheddar Cheese", quantity: 1, expiryDate: new Date(Date.now() - 86400000).toISOString() },
  { id: 6, name: "Strawberries", quantity: 1, expiryDate: new Date(Date.now() + 86400000 * 3).toISOString() },
  { id: 7, name: "Orange Juice", quantity: 2, expiryDate: new Date(Date.now() + 86400000 * 7).toISOString() },
  { id: 8, name: "Chicken Breast", quantity: 2, expiryDate: new Date(Date.now() + 86400000 * 2).toISOString() },
];

export function useInventory() {
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [sort, setSort] = useState("expiry");

  const load = useCallback(async (sortBy = sort) => {
    setLoading(true);
    try {
      const data = await fetchItems(sortBy);
      setItems(data);
      setOffline(false);
    } catch {
      setOffline(true);
      setItems(DEMO_ITEMS);
      toast("Backend offline — showing demo data", { icon: "⚡" });
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => { load(); }, []);

  const changeSort = (s: string) => { setSort(s); load(s); };

  const updateQty = async (id: number | string, qty: number) => {
    const newQty = Math.max(0, qty);
    // Optimistic update
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)));
    if (!offline) {
      try {
        await updateItemQty(id, newQty);
      } catch {
        // Revert on error
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
        toast.error("Failed to update quantity");
      }
    }
  };

  const updateExpiry = async (id: number | string, expiryDate?: string) => {
    const normalized = expiryDate?.trim() ? expiryDate : undefined;
    const prev = items.find((i) => i.id === id)?.expiryDate;
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, expiryDate: normalized } : i)));
    if (!offline) {
      try {
        await updateItem(id, { expiryDate: normalized ?? undefined });
      } catch {
        setItems((cur) => cur.map((i) => (i.id === id ? { ...i, expiryDate: prev } : i)));
        toast.error("Failed to update expiry date");
      }
    }
  };

  const removeItem = async (id: number | string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (!offline) {
      try {
        await deleteItem(id);
        toast.success("Item removed from fridge");
      } catch {
        load(); // Refetch to restore state
        toast.error("Failed to delete item");
      }
    }
  };

  return { items, loading, offline, load, sort, changeSort, updateQty, updateExpiry, removeItem };
}
