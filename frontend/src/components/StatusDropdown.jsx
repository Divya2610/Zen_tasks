import { useState, useRef, useEffect } from "react";
import { MdKeyboardArrowDown, MdCheck } from "react-icons/md";
import clsx   from "clsx";
import { toast } from "sonner";
import api    from "../utils/api";

const STAGES = [
  {
    value: "todo",
    label: "To Do",
    bg:    "bg-violet-100",
    text:  "text-violet-700",
    dot:   "bg-violet-500",
  },
  {
    value: "in progress",
    label: "In Progress",
    bg:    "bg-amber-100",
    text:  "text-amber-700",
    dot:   "bg-amber-500",
  },
  {
    value: "completed",
    label: "Completed",
    bg:    "bg-emerald-100",
    text:  "text-emerald-700",
    dot:   "bg-emerald-500",
  },
];

/**
 * StatusDropdown
 *
 * Props:
 *   taskId   – MongoDB _id of the task
 *   current  – current stage string ("todo" | "in progress" | "completed")
 *   onChange – optional callback(newStage) after successful update
 *   readOnly – if true, shows the pill without the dropdown arrow (admin view)
 */
const StatusDropdown = ({ taskId, current, onChange, readOnly = false }) => {
  const [stage, setStage]   = useState(current || "todo");
  const [open, setOpen]     = useState(false);
  const [saving, setSaving] = useState(false);
  const ref                 = useRef(null);

  const active = STAGES.find((s) => s.value === stage) || STAGES[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = async (newStage) => {
    if (newStage === stage) { setOpen(false); return; }
    setOpen(false);

    const prev = stage;
    setStage(newStage); // optimistic update

    try {
      setSaving(true);
      await api.patch(`/tasks/${taskId}/stage`, { stage: newStage });
      onChange?.(newStage);

      const label = STAGES.find((s) => s.value === newStage)?.label;
      toast.success(`Task moved to ${label}`);
    } catch (err) {
      setStage(prev); // rollback on error
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  // ── Read-only pill (for admins who just want to see the status) ──────────
  if (readOnly) {
    return (
      <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", active.bg, active.text)}>
        <span className={clsx("w-1.5 h-1.5 rounded-full", active.dot)} />
        {active.label}
      </span>
    );
  }

  return (
    <div ref={ref} className="relative inline-block">
      {/* Pill trigger */}
      <button
        disabled={saving}
        onClick={() => setOpen((p) => !p)}
        className={clsx(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-opacity",
          active.bg, active.text,
          saving && "opacity-60 cursor-not-allowed",
          !saving && "hover:opacity-80 cursor-pointer"
        )}
      >
        <span className={clsx("w-1.5 h-1.5 rounded-full", active.dot)} />
        {active.label}
        {!saving && (
          <MdKeyboardArrowDown
            className={clsx("text-base transition-transform", open && "rotate-180")}
          />
        )}
        {saving && (
          <svg className="animate-spin w-3 h-3 ml-0.5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".3"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {/* Dropdown options */}
      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 bg-white border border-gray-200 rounded-xl shadow-xl min-w-[155px] overflow-hidden py-1">
          {STAGES.map((s) => (
            <button
              key={s.value}
              onClick={() => handleSelect(s.value)}
              className={clsx(
                "flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-left transition-colors",
                s.value === stage ? "bg-gray-50" : "hover:bg-gray-50"
              )}
            >
              <span className={clsx("w-2 h-2 rounded-full flex-shrink-0", s.dot)} />
              <span className={clsx("flex-1 font-medium", s.text)}>{s.label}</span>
              {s.value === stage && <MdCheck className="text-gray-400 text-sm" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
