import React, { useState } from "react";
import {
  FiChevronRight,
  FiChevronDown,
  FiCheckCircle,
  FiCircle,
  FiClock,
  FiUser,
  FiGrid,   // ← add this
} from "react-icons/fi";

const PRIORITY_COLORS = {
  high: "bg-red-100 text-red-600",
  medium: "bg-amber-100 text-amber-600",
  normal: "bg-blue-100 text-blue-600",
  low: "bg-gray-100 text-gray-500",
};

const STAGE_ICONS = {
  completed: <FiCheckCircle size={14} className="text-emerald-500" />,
  "in progress": <FiClock size={14} className="text-amber-500" />,
  todo: <FiCircle size={14} className="text-gray-400" />,
};

const initials = (name) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

// ── Subtask Row ──────────────────────────────────────────────────────────────
const SubTaskRow = ({ sub, depth = 2 }) => {
  const assignees = sub.team || [];

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group">
      {/* Indent + connector */}
      <div className="flex items-center" style={{ paddingLeft: `${depth * 20}px` }}>
        <div className="w-4 h-px bg-gray-200 mr-2" />
        <div className="flex-shrink-0">
          {STAGE_ICONS[sub.stage] || STAGE_ICONS.todo}
        </div>
      </div>

      {/* Label */}
      <span className="flex-1 text-sm text-gray-600 truncate">{sub.title}</span>

      {/* Priority badge */}
      {sub.priority && (
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
            PRIORITY_COLORS[sub.priority] || PRIORITY_COLORS.normal
          }`}
        >
          {sub.priority}
        </span>
      )}

      {/* Due date */}
      {sub.date && (
        <span className="text-xs text-gray-400 hidden sm:block">
          {new Date(sub.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      )}

      {/* Assignees */}
      <div className="flex -space-x-1.5">
        {assignees.slice(0, 3).map((member, i) => (
          <div
            key={member._id || i}
            title={member.name}
            className="w-6 h-6 rounded-full bg-indigo-100 border border-white flex items-center justify-center text-[10px] font-semibold text-indigo-600"
          >
            {initials(member.name)}
          </div>
        ))}
        {assignees.length === 0 && (
          <div title="Unassigned" className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center">
            <FiUser size={10} className="text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};

// ── Task Row (Objective) ─────────────────────────────────────────────────────
const TaskRow = ({ task, index }) => {
  const [expanded, setExpanded] = useState(true);
  const subTasks = task.subTasks || [];
  const assignees = task.team || [];

  return (
    <div className="mb-2">
      {/* Task header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-indigo-50 cursor-pointer transition-colors group"
      >
        {/* Expand toggle */}
        <button className="flex-shrink-0 text-gray-400 group-hover:text-indigo-500 transition-colors">
          {subTasks.length > 0 ? (
            expanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />
          ) : (
            <div className="w-4" />
          )}
        </button>

        {/* Objective number */}
        <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-indigo-600">{index + 1}</span>
        </div>

        {/* Stage icon */}
        <div className="flex-shrink-0">
          {STAGE_ICONS[task.stage] || STAGE_ICONS.todo}
        </div>

        {/* Title */}
        <span className="flex-1 text-sm font-medium text-gray-800 truncate">
          {task.title}
        </span>

        {/* Sub-task count */}
        {subTasks.length > 0 && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full hidden sm:block">
            {subTasks.length} motivations
          </span>
        )}

        {/* Priority */}
        {task.priority && (
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
              PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.normal
            }`}
          >
            {task.priority}
          </span>
        )}

        {/* Due date */}
        {task.date && (
          <span className="text-xs text-gray-400 hidden md:block">
            {new Date(task.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}

        {/* Assignees */}
        <div className="flex -space-x-1.5 flex-shrink-0">
          {assignees.slice(0, 4).map((member, i) => (
            <div
              key={member._id || i}
              title={member.name}
              className="w-7 h-7 rounded-full bg-indigo-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-indigo-700"
            >
              {initials(member.name)}
            </div>
          ))}
          {assignees.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-500">
              +{assignees.length - 4}
            </div>
          )}
          {assignees.length === 0 && (
            <div title="Unassigned" className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
              <FiUser size={12} className="text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Subtasks */}
      {expanded && subTasks.length > 0 && (
        <div className="ml-4 border-l-2 border-indigo-100 pl-2 mt-1">
          {subTasks.map((sub) => (
            <SubTaskRow key={sub._id} sub={sub} depth={1} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── ProjectTree (main export) ────────────────────────────────────────────────
const ProjectTree = ({ tasks = [] }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <FiGrid size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">No objectives added yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Column headers */}
      <div className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-2">
        <div className="w-4" />
        <div className="w-6" />
        <div className="w-4" />
        <span className="flex-1">Objective / Motivation</span>
        <span className="hidden sm:block w-24 text-center">Status</span>
        <span className="hidden md:block w-20 text-center">Due</span>
        <span className="w-20 text-right">Assigned To</span>
      </div>

      {tasks.map((task, i) => (
        <TaskRow key={task._id} task={task} index={i} />
      ))}
    </div>
  );

};



export default ProjectTree;
