// // src/pages/Tasks.jsx
// import React, { useState, useEffect, useCallback } from "react";
// import { useSelector } from "react-redux";
// import clsx from "clsx";
// import { toast } from "sonner";
// import Tabs from "../components/Tabs.jsx";
// import TaskCard from "../components/TaskCard.jsx";
// import TeamMemberTaskCard from "../components/TeamMemberTaskCard.jsx";
// import Loader from "../components/Loader.jsx";
// import { useSearchParams } from "react-router-dom";
// import api from "../utils/api.js";

// const TABS = [
//   { title: "Board", icon: "🗂" },
//   { title: "List", icon: "📋" },
// ];

// const STAGE_FILTERS = ["all", "todo", "in progress", "completed"];

// export default function Tasks() {
//   const { user } = useSelector((state) => state.auth);
//   const isAdmin = user?.isAdmin;

//   const [searchParams] = useSearchParams();
//   const stageParam = searchParams.get("stage");

//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selected, setSelected] = useState(0); // tab index
//   const [stageFilter, setStageFilter] = useState(stageParam || "all");

//   // ── Fetch tasks (backend filters by role automatically) ───────────────────
//   const fetchTasks = useCallback(async () => {
//     setLoading(true);
//     try {
//       const params = {};
//       if (stageFilter !== "all") params.stage = stageFilter;

//       const { data } = await api.get("/task", { params });
//       setTasks(data.tasks || []);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to load tasks");
//     } finally {
//       setLoading(false);
//     }
//   }, [stageFilter]);

//   useEffect(() => {
//     fetchTasks();
//   }, [fetchTasks]);

//   // ── Grouping for Board view ───────────────────────────────────────────────
//   const grouped = {
//     todo: tasks.filter((t) => t.stage === "todo"),
//     "in progress": tasks.filter((t) => t.stage === "in progress"),
//     completed: tasks.filter((t) => t.stage === "completed"),
//   };

//   return (
//     <div className="w-full">
//       {/* ── Page Header ── */}
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <h1 className="text-xl font-bold text-gray-800">
//             {isAdmin ? "All Tasks" : "My Tasks"}
//           </h1>
//           <p className="text-sm text-gray-500 mt-0.5">
//             {isAdmin
//               ? "Manage all tasks across the team"
//               : "Tasks assigned to you — update status or upload documents"}
//           </p>
//         </div>

//         {/* Admin gets the "Add Task" button rendered from the Navbar/Sidebar – nothing extra here */}
//       </div>

//       {/* ── Stage Filter Pills ── */}
//       <div className="flex items-center gap-2 flex-wrap mb-4">
//         {STAGE_FILTERS.map((s) => (
//           <button
//             key={s}
//             onClick={() => setStageFilter(s)}
//             className={clsx(
//               "text-xs px-3 py-1.5 rounded-full font-medium capitalize border transition-all",
//               stageFilter === s
//                 ? "bg-blue-600 text-white border-blue-600"
//                 : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
//             )}
//           >
//             {s === "all" ? `All (${tasks.length})` : s}
//           </button>
//         ))}
//       </div>

//       {/* ── View Tabs (Board / List) ── */}
//       <Tabs tabs={TABS} setSelected={setSelected}>
//         {loading ? (
//           <div className="flex justify-center py-16">
//             <Loader />
//           </div>
//         ) : tasks.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-20 text-gray-400">
//             <span className="text-5xl mb-3">📭</span>
//             <p className="text-sm font-medium">
//               {isAdmin ? "No tasks found." : "No tasks assigned to you yet."}
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* ── BOARD VIEW ── */}
//             {selected === 0 && (
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
//                 {Object.entries(grouped).map(([stage, stageTasks]) => (
//                   <div key={stage}>
//                     <div className="flex items-center gap-2 mb-3">
//                       <h2 className="text-sm font-semibold text-gray-600 capitalize">
//                         {stage}
//                       </h2>
//                       <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
//                         {stageTasks.length}
//                       </span>
//                     </div>
//                     <div className="space-y-3">
//                       {stageTasks.map((task) =>
//                         isAdmin ? (
//                           <TaskCard key={task._id} task={task} />
//                         ) : (
//                           <TeamMemberTaskCard
//                             key={task._id}
//                             task={task}
//                             onRefresh={fetchTasks}
//                           />
//                         )
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* ── LIST VIEW ── */}
//             {selected === 1 && (
//               <div className="mt-4 space-y-3">
//                 {tasks.map((task) =>
//                   isAdmin ? (
//                     <TaskCard key={task._id} task={task} />
//                   ) : (
//                     <TeamMemberTaskCard
//                       key={task._id}
//                       task={task}
//                       onRefresh={fetchTasks}
//                     />
//                   )
//                 )}
//               </div>
//             )}
//           </>
//         )}
//       </Tabs>
//     </div>
//   );
// }


import { useState, useEffect, useCallback } from "react";
import { toast }            from "sonner";
import clsx                 from "clsx";
import moment               from "moment";
import { MdAddTask, MdOutlineAttachment, MdOutlineSubtitles } from "react-icons/md";
import { BiMessageRounded } from "react-icons/bi";
import { FiDownload }       from "react-icons/fi";
import { useSelector }      from "react-redux"; // adjust to your auth store
import api                  from "../utils/api";
import Loading              from "../components/Loader";
import StatusDropdown       from "../components/StatusDropdown";
import AdminTaskCard        from "../components/TaskCard";
import TaskForm             from "../components/task/TaskForm";
import { getInitials, TASK_TYPE, PRIORITY_STYLES } from "../utils";
import { getAssetHref, getAssetName, getAssetRole } from "../utils/assets";
import { isAdminUser } from "../utils/role";

// ── Section config ────────────────────────────────────────────────────────────
const SECTIONS = [
  { key: "todo",        label: "To Do",       color: "text-violet-600", border: "border-violet-400", badge: "bg-violet-100 text-violet-700" },
  { key: "in progress", label: "In Progress", color: "text-amber-600",  border: "border-amber-400",  badge: "bg-amber-100  text-amber-700"  },
  { key: "completed",   label: "Completed",   color: "text-emerald-600",border: "border-emerald-400",badge: "bg-emerald-100 text-emerald-700"},
];

// ── Single task card ──────────────────────────────────────────────────────────
const TaskCard = ({ task, currentUser, onStageChange }) => {
  const isAdmin = isAdminUser(currentUser);

  // Download an attachment
  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob     = await response.blob();
      const link     = document.createElement("a");
      link.href      = URL.createObjectURL(blob);
      link.download  = filename || "attachment";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3">
      {/* ── Priority + menu ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className={clsx("text-xs font-semibold uppercase tracking-wide", PRIORITY_STYLES[task.priority])}>
          {task.priority} priority
        </span>
        {/* Status dropdown — members can change; admins see a read-only pill */}
        <StatusDropdown
          taskId={task._id}
          current={task.stage}
          onChange={(newStage) => onStageChange(task._id, newStage)}
          readOnly={isAdmin}
        />
      </div>

      {/* ── Title ───────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-2">
        <div className={clsx("w-3 h-3 rounded-full mt-1 flex-shrink-0", TASK_TYPE[task.stage])} />
        <p className="text-sm font-semibold text-gray-900 leading-snug">{task.title}</p>
      </div>

      {/* ── Date ────────────────────────────────────────────────────────── */}
      <p className="text-xs text-gray-400">📅 {moment(task.date).format("DD-MMM-YYYY")}</p>

      {/* ── Meta counts ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <BiMessageRounded className="text-sm" />
          {task.activities?.length ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <MdOutlineAttachment className="text-sm" />
          {task.assets?.length ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <MdOutlineSubtitles className="text-sm" />
          {task.subTasks?.filter((s) => s.completed).length ?? 0}/
          {task.subTasks?.length ?? 0}
        </span>

        {/* Team avatars */}
        <div className="flex items-center gap-1 ml-auto">
          {task.team?.slice(0, 3).map((member, i) => (
            <div
              key={member._id ?? i}
              title={member.username}
              className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-semibold -ml-1 first:ml-0 ring-2 ring-white"
            >
              {getInitials(member.username || "?")}
            </div>
          ))}
          {(task.team?.length ?? 0) > 3 && (
            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-semibold -ml-1 ring-2 ring-white">
              +{task.team.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* ── Attachments ─────────────────────────────────────────────────── */}
      {task.assets?.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Attachments
          </p>
          <div className="flex flex-col gap-2">
            {task.assets.map((asset, i) => {
              const url      = getAssetHref(asset);
              const filename = getAssetName(asset) || `file-${i + 1}`;
              const role     = getAssetRole(asset);
              const short    = filename.length > 28 ? filename.slice(0, 25) + "…" : filename;

              return (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
                >
                  <MdOutlineAttachment className="text-gray-400 text-base flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 truncate">{short}</p>
                    <p className="text-[10px] text-violet-500">
                      {role === "admin" ? "From admin" : "From member"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(url, filename)}   // ✅ pass url, not asset
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
                  >
                    <FiDownload className="text-sm" />
                    Download
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Sub-tasks ───────────────────────────────────────────────────── */}
      {task.subTasks?.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Sub-tasks
          </p>
          <ul className="flex flex-col gap-1.5">
            {task.subTasks.map((sub, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                <span className={clsx("w-2 h-2 rounded-full flex-shrink-0", sub.completed ? "bg-emerald-500" : "bg-gray-300")} />
                <span className={sub.completed ? "line-through text-gray-400" : ""}>{sub.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ── Main Tasks page ───────────────────────────────────────────────────────────
const Tasks = () => {
  const { user }          = useSelector((s) => s.auth);
  const isAdmin = isAdminUser(user);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  // ── Fetch tasks (backend already filters by user role) ──────────────────
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/tasks");
      setTasks(data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── When a task stage changes, move it to the correct section locally ────
  const handleStageChange = (taskId, newStage) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, stage: newStage } : t))
    );
  };

  // ── Group tasks by stage ─────────────────────────────────────────────────
  const grouped = Object.fromEntries(
    SECTIONS.map((s) => [s.key, tasks.filter((t) => t.stage === s.key)])
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loading />
      </div>
    );
  }

  return (
    <div className="h-full py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {isAdmin ? "Task Management" : "My Tasks"}
          </h1>
          <p className="text-sm text-gray-400">
            {isAdmin
              ? "Create, assign, edit, delete, add sub-tasks, and attach files."
              : "Tasks assigned to you"} · {tasks.length} total
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <MdAddTask className="text-lg" />
            Create Task
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
          <MdOutlineSubtitles className="text-6xl" />
          <p className="text-base">
            {isAdmin ? "No tasks yet. Create one to assign work." : "No tasks assigned to you yet."}
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <MdAddTask className="text-lg" />
              Create Task
            </button>
          )}
        </div>
      ) : (
        /* ── Kanban-style three column layout ─────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SECTIONS.map((section) => (
            <div key={section.key} className="flex flex-col gap-4">
              {/* Section header */}
              <div className={clsx("flex items-center gap-2 pb-2 border-b-2", section.border)}>
                <h2 className={clsx("text-sm font-semibold uppercase tracking-wide", section.color)}>
                  {section.label}
                </h2>
                <span className={clsx("text-xs font-bold px-2 py-0.5 rounded-full", section.badge)}>
                  {grouped[section.key]?.length ?? 0}
                </span>
              </div>

              {/* Task cards */}
              {grouped[section.key]?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-300 text-sm border-2 border-dashed border-gray-100 rounded-xl">
                  No tasks
                </div>
              ) : (
                grouped[section.key].map((task) =>
                  isAdmin ? (
                    <AdminTaskCard
                      key={task._id}
                      task={task}
                      isAdmin
                      onChanged={fetchTasks}
                    />
                  ) : (
                    <TaskCard
                      key={task._id}
                      task={task}
                      currentUser={user}
                      onStageChange={handleStageChange}
                    />
                  )
                )
              )}
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <TaskForm
          open={createOpen}
          setOpen={setCreateOpen}
          onSuccess={fetchTasks}
        />
      )}
    </div>
  );
};

export default Tasks;
