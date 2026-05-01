export function daysLeft(dateStr?: string): number | null {
  if (!dateStr) return null;
  const exp = new Date(dateStr);
  exp.setHours(23, 59, 59, 999);
  return Math.ceil((exp.getTime() - Date.now()) / 86400000);
}

export function expiryBadge(days: number | null) {
  if (days === null) return { cls: "badge-warn", label: "No expiry" };
  if (days <= 0) return { cls: "badge-critical", label: "Expired" };
  if (days === 1) return { cls: "badge-critical", label: "1 day left" };
  if (days <= 2) return { cls: "badge-critical", label: `${days}d left` };
  if (days <= 5) return { cls: "badge-warn", label: `${days}d left` };
  return { cls: "badge-fresh", label: `${days}d left` };
}

export function formatExpiryDate(dateStr?: string): string {
  if (!dateStr) return "Expiry date not detected";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "Expiry date not detected";
  return `Expires ${date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;
}

export function itemEmoji(name = ""): string {
  const n = name.toLowerCase();
  if (n.includes("apple") || n.includes("fruit")) return "🍎";
  if (n.includes("milk")) return "🥛";
  if (n.includes("egg")) return "🥚";
  if (n.includes("bread")) return "🍞";
  if (n.includes("cheese")) return "🧀";
  if (n.includes("chicken") || n.includes("meat")) return "🍗";
  if (n.includes("fish") || n.includes("salmon")) return "🐟";
  if (n.includes("carrot") || n.includes("vegetable")) return "🥕";
  if (n.includes("berry") || n.includes("straw")) return "🍓";
  if (n.includes("juice")) return "🧃";
  if (n.includes("yogurt")) return "🥣";
  if (n.includes("butter")) return "🧈";
  if (n.includes("tomato")) return "🍅";
  if (n.includes("lemon") || n.includes("orange")) return "🍊";
  return "🧊";
}

export function capitalize(s = ""): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
