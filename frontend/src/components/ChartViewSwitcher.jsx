import { useState, useRef, useEffect } from "react";
import moment from "moment";
import clsx from "clsx";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ─── Colour maps ──────────────────────────────────────────────────────────────
const STAGE_COLORS = {
  "To Do":       "#6366f1",
  "In Progress": "#f59e0b",
  "Completed":   "#10b981",
};

const PRIORITY_COLORS = {
  high:   "#ef4444",
  medium: "#f59e0b",
  low:    "#22c55e",
};

const STAGE_BADGE = {
  "To Do":       "bg-violet-100 text-violet-700",
  "In Progress": "bg-amber-100  text-amber-700",
  "Completed":   "bg-emerald-100 text-emerald-700",
};

const PRIORITY_BADGE = {
  high:   "bg-red-100   text-red-600",
  medium: "bg-amber-100 text-amber-600",
  low:    "bg-green-100 text-green-600",
};

const VIEWS = [
  { value: "bar",   label: "Bar Chart",   icon: "📊" },
  { value: "pie",   label: "Pie Chart",   icon: "🥧" },
  { value: "gantt", label: "Gantt Chart", icon: "📅" },
];

// ─── Tooltips ─────────────────────────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 mb-0.5">{label}</p>
      <p className="text-gray-500">
        Tasks: <span className="font-bold text-gray-900">{payload[0].value}</span>
      </p>
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-lg text-sm">
      <p className="font-semibold text-gray-700">{payload[0].name}</p>
      <p className="text-gray-500">
        Tasks: <span className="font-bold text-gray-900">{payload[0].value}</span>
      </p>
    </div>
  );
};

// ─── Dropdown ─────────────────────────────────────────────────────────────────
const ViewDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = VIEWS.find((v) => v.value === value);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative select-none z-10">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md transition-all duration-150"
      >
        <span className="text-base">{selected?.icon}</span>
        <span>{selected?.label}</span>
        <svg
          className={clsx(
            "w-4 h-4 text-gray-400 transition-transform duration-200",
            open && "rotate-180"
          )}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] bg-white border border-gray-200 rounded-xl shadow-xl min-w-[175px] overflow-hidden">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              onClick={() => { onChange(v.value); setOpen(false); }}
              className={clsx(
                "flex items-center gap-3 w-full px-4 py-3 text-sm text-left transition-colors duration-100",
                v.value === value
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-50 font-normal"
              )}
            >
              <span className="text-base">{v.icon}</span>
              <span className="flex-1">{v.label}</span>
              {v.value === value && (
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Bar View ─────────────────────────────────────────────────────────────────
const BarView = ({ data }) => (
  <div className="w-full">
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 5 }} barSize={72}>
        <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip content={<BarTooltip />} cursor={{ fill: "#f8fafc", radius: 6 }} />
        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={STAGE_COLORS[entry.name] || "#6366f1"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>

    <div className="flex items-center justify-center gap-6 mt-1 flex-wrap">
      {data.map((d) => (
        <span key={d.name} className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: STAGE_COLORS[d.name] || "#6366f1" }} />
          {d.name}
          <span className="font-semibold text-gray-700">({d.total})</span>
        </span>
      ))}
    </div>
  </div>
);

// ─── Pie View ─────────────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>
      {Math.round(percent * 100)}%
    </text>
  );
};

const PieView = ({ data }) => {
  const hasData = data.some((d) => d.total > 0);
  const display = hasData ? data.filter((d) => d.total > 0) : [{ name: "No Tasks Yet", total: 1 }];
  const grandTotal = data.reduce((s, d) => s + d.total, 0);

  return (
    <div className="w-full flex flex-col md:flex-row items-center gap-6">
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={display}
              cx="50%" cy="50%"
              outerRadius={120} innerRadius={52}
              dataKey="total"
              labelLine={false}
              label={hasData ? PieLabel : false}
              strokeWidth={3} stroke="#fff"
            >
              {display.map((entry, i) => (
                <Cell key={i} fill={hasData ? (STAGE_COLORS[entry.name] || "#6366f1") : "#e2e8f0"} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Side legend */}
      <div className="flex flex-col gap-4 min-w-[160px]">
        {data.map((d) => {
          const pct = grandTotal > 0 ? Math.round((d.total / grandTotal) * 100) : 0;
          return (
            <div key={d.name} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: STAGE_COLORS[d.name] || "#e2e8f0" }} />
              <div className="flex-1">
                <p className="text-xs text-gray-500 leading-none mb-1">{d.name}</p>
                <p className="text-sm font-semibold text-gray-800">
                  {d.total}{" "}
                  <span className="text-gray-400 font-normal text-xs">({pct}%)</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Gantt View ───────────────────────────────────────────────────────────────
const normaliseStage = (stage) => {
  if (!stage) return "To Do";
  const s = stage.toLowerCase().trim();
  if (s === "todo")        return "To Do";
  if (s === "in progress") return "In Progress";
  if (s === "completed")   return "Completed";
  return "To Do";
};

// Approximate effort days by stage (visual only)
const EFFORT_DAYS = { "To Do": 5, "In Progress": 10, "Completed": 7 };

const GanttView = ({ tasks }) => {
  if (!tasks?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
        <span className="text-4xl">📭</span>
        <p className="text-sm">No tasks to display on the timeline</p>
      </div>
    );
  }

  const sorted = [...tasks].sort((a, b) => new Date(a.date) - new Date(b.date));
  const earliest = moment(sorted[0].date);
  const latest   = moment(sorted[sorted.length - 1].date);
  const spanDays = Math.max(latest.diff(earliest, "days") + 14, 21);

  const markers = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    pct: f * 100,
    label: earliest.clone().add(Math.round(f * spanDays), "days").format("MMM D"),
  }));

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[540px]">
        {/* Timeline header */}
        <div className="flex mb-3 pl-[190px]">
          <div className="flex-1 relative h-5">
            {markers.map(({ pct, label }) => (
              <span
                key={pct}
                className="absolute text-[11px] text-gray-400 -translate-x-1/2 whitespace-nowrap"
                style={{ left: `${pct}%` }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Task rows */}
        {sorted.map((task, idx) => {
          const sl      = normaliseStage(task.stage);
          const color   = STAGE_COLORS[sl]               || "#6366f1";
          const pColor  = PRIORITY_COLORS[task.priority] || "#6366f1";
          const dayOff  = moment(task.date).diff(earliest, "days");
          const effort  = EFFORT_DAYS[sl] ?? 5;
          const leftPct = (dayOff / spanDays) * 100;
          const wPct    = Math.min((effort / spanDays) * 100, 100 - leftPct);

          return (
            <div
              key={task._id || idx}
              className={clsx(
                "flex items-center mb-3 pb-3",
                idx < sorted.length - 1 && "border-b border-gray-100"
              )}
            >
              {/* Label */}
              <div className="w-[190px] flex-shrink-0 pr-3">
                <p className="text-[13px] font-medium text-gray-800 truncate leading-tight mb-1.5">
                  {task.title}
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-semibold", STAGE_BADGE[sl])}>
                    {sl}
                  </span>
                  <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize", PRIORITY_BADGE[task.priority] || "bg-gray-100 text-gray-500")}>
                    {task.priority}
                  </span>
                </div>
              </div>

              {/* Track */}
              <div className="flex-1 relative h-8 bg-gray-50 rounded-lg overflow-hidden">
                {[0.25, 0.5, 0.75].map((f) => (
                  <div key={f} className="absolute top-0 bottom-0 w-px bg-gray-200" style={{ left: `${f * 100}%` }} />
                ))}

                <div
                  className="absolute top-1/2 -translate-y-1/2 h-[22px] rounded-md flex items-center gap-1.5 px-2.5 transition-all"
                  style={{ left: `${leftPct}%`, width: `${Math.max(wPct, 4)}%`, background: color, opacity: 0.88, minWidth: 38 }}
                  title={`${task.title} · ${sl} · ${moment(task.date).format("MMM D, YYYY")}`}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: pColor, border: "2px solid rgba(255,255,255,.65)" }}
                  />
                  <span className="text-[11px] text-white font-semibold truncate whitespace-nowrap">
                    {moment(task.date).format("MMM D")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Info footer */}
        <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
          <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-600 leading-relaxed">
            Bar position = task creation date &nbsp;·&nbsp; Bar width = estimated effort per stage &nbsp;·&nbsp; Dot = priority
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────
/**
 * Drop-in replacement for <Chart data={chartData} />.
 *
 * Usage in Dashboard.jsx:
 *   import ChartViewSwitcher from "../components/ChartViewSwitcher";
 *   <ChartViewSwitcher data={chartData} tasks={summary?.recentTasks ?? []} />
 *
 * Props:
 *   data  – [{ name: "To Do"|"In Progress"|"Completed", total: number }]
 *   tasks – summary.recentTasks from /dashboard API  (for Gantt timeline)
 */
const ChartViewSwitcher = ({ data = [], tasks = [] }) => {
  const [view, setView] = useState("bar");

  const subtitle = {
    bar:   "Task count grouped by stage",
    pie:   "Proportional breakdown across stages",
    gantt: `Timeline view · ${tasks.length} recent task${tasks.length !== 1 ? "s" : ""}`,
  }[view];

  return (
    <div className="w-full bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h4 className="text-xl text-gray-600 font-semibold">Chart by Task Stage</h4>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        <ViewDropdown value={view} onChange={setView} />
      </div>

      {/* Quick summary pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {data.map((d) => (
          <div
            key={d.name}
            className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5"
          >
            <span className="w-2 h-2 rounded-full" style={{ background: STAGE_COLORS[d.name] || "#6366f1" }} />
            <span className="text-xs text-gray-500">{d.name}</span>
            <span className="text-xs font-bold text-gray-800">{d.total}</span>
          </div>
        ))}
      </div>

      {/* Chart — fades in on view switch */}
      <div key={view} style={{ animation: "fadeSlideIn .22s ease both" }}>
        {view === "bar"   && <BarView   data={data}   />}
        {view === "pie"   && <PieView   data={data}   />}
        {view === "gantt" && <GanttView tasks={tasks} />}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </div>
  );
};

export default ChartViewSwitcher;
