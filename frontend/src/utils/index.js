// ─── Date Utilities ────────────────────────────────────────────────────────────

export const formatDate = (date, style = "display") => {
  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d)) return "Invalid Date";

  if (style === "input") {
    // Returns YYYY-MM-DD — useful for <input type="date"> values
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Default: returns "15-Jan-2024" — human-readable display format
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = d.getDate();
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// Alias so existing imports of dateFormatter don't break
export const dateFormatter = (dateString) => formatDate(dateString, "input");

// ─── String Utilities ──────────────────────────────────────────────────────────

export const getInitials = (username) => {
  if (!username || typeof username !== "string") return "";
  const parts = username.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts.map((name) => name.charAt(0).toUpperCase()).join("");
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const PRIORITY_STYLES = {
  high: "text-red-600",
  medium: "text-yellow-600",
  // FIX: was "low" key missing — model enum was "normal", now both use "low"
  low: "text-blue-600",
};

// FIX: priority icons — used in TaskCard and TaskDetails
export const PRIORITY_ICONS_MAP = {
  high: "double-up",
  medium: "up",
  low: "down",
};

export const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
};

export const BGS = [
  "bg-blue-600",
  "bg-yellow-600",
  "bg-red-600",
  "bg-green-600",
];

// Priority options for dropdowns — single source of truth
// FIX: was "normal" in model, now "low" everywhere
export const PRIORITY_OPTIONS = ["high", "medium", "low"];

// Stage options for dropdowns
export const STAGE_OPTIONS = ["todo", "in progress", "completed"];