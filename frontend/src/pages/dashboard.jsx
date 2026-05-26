
import React, { useState, useEffect } from "react";
import {
  MdAdminPanelSettings,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { MdOutlineEdit } from "react-icons/md";
import { FaNewspaper, FaUsers } from "react-icons/fa";
import { FaArrowsToDot } from "react-icons/fa6";
import moment from "moment";
import clsx from "clsx";
import ChartViewSwitcher from "../components/ChartViewSwitcher";
import { BGS, PRIORITY_STYLES, TASK_TYPE, getInitials } from "../utils";
import { toast } from "sonner";
import api from "../utils/api";
import Loading from "../components/Loader";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const TaskTable = ({ tasks }) => (
  <div className="w-full md:w-2/3 bg-white px-2 md:px-4 pt-4 pb-4 shadow-md rounded">
    <table className="w-full">
      <thead className="border-b border-gray-300">
        <tr className="text-black text-left">
          <th className="py-2">Task Title</th>
          <th className="py-2">Priority</th>
          <th className="py-2 hidden md:block">Created At</th>
        </tr>
      </thead>
      <tbody>
        {tasks?.map((task) => (
          <tr
            key={task._id}
            className="border-b border-gray-300 text-gray-600 hover:bg-gray-300/10"
          >
            <td className="py-2">
              <div className="flex items-center gap-2">
                <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])} />
                <p className="text-base text-black">{task.title}</p>
              </div>
            </td>
            <td className="py-2">
              <div className="flex gap-1 items-center">
                {ICONS[task.priority] && (
                  <span className={clsx("text-lg", PRIORITY_STYLES[task.priority])}>
                    {ICONS[task.priority]}
                  </span>
                )}
                <span className="capitalize">{task.priority}</span>
              </div>
            </td>
            <td className="py-2 hidden md:block">
              <span className="text-base text-gray-600">
                {moment(task?.date).fromNow()}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const UserTable = ({ users }) => (
  <div className="w-full md:w-1/3 bg-white h-fit px-2 md:px-6 py-4 shadow-md rounded">
    <table className="w-full mb-5">
      <thead className="border-b border-gray-300">
        <tr className="text-black text-left">
          <th className="py-2">Full Name</th>
          <th className="py-2">Status</th>
          <th className="py-2">Created At</th>
        </tr>
      </thead>
      <tbody>
        {users?.map((user) => (
          <tr
            key={user._id}
            className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10"
          >
            <td className="py-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-violet-700">
                  <span>{getInitials(user?.username || "U")}</span>
                </div>
                <div>
                  <p>{user.username}</p>
                  <span className="text-xs text-black">{user?.role}</span>
                </div>
              </div>
            </td>
            <td>
              <p
                className={clsx(
                  "w-fit px-3 py-1 rounded-full text-sm",
                  user?.isActive ? "bg-blue-200" : "bg-yellow-100"
                )}
              >
                {user?.isActive ? "Active" : "Disabled"}
              </p>
            </td>
            <td className="py-2 text-sm">{moment(user?.createdAt).fromNow()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get("/dashboard");
        setSummary(data);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loading />
      </div>
    );

  const buildChartData = () => {
    if (summary?.tasksByStage) {
      return [
        { name: "To Do",       total: summary.tasksByStage.todo ?? 0 },
        { name: "In Progress", total: summary.tasksByStage["in progress"] ?? 0 },
        { name: "Completed",   total: summary.tasksByStage.completed ?? 0 },
      ];
    }

    const counts = { todo: 0, "in progress": 0, completed: 0 };
    (summary?.recentTasks ?? []).forEach((t) => {
      const stage = t.stage?.toLowerCase();
      if (stage in counts) counts[stage]++;
    });
    return [
      { name: "To Do",       total: counts.todo },
      { name: "In Progress", total: counts["in progress"] },
      { name: "Completed",   total: counts.completed },
    ];
  };

  const chartData = buildChartData();

  const stats = [
    {
      _id: "1",
      label: "TOTAL TASKS",
      total: summary?.totalTasks ?? 0,
      icon: <FaNewspaper />,
      bg: "bg-[#1d4ed8]",
    },
    {
      _id: "2",
      label: "COMPLETED",
      total: summary?.completedTasks ?? 0,
      icon: <MdAdminPanelSettings />,
      bg: "bg-[#0f766e]",
    },
    {
      _id: "3",
      label: "TASK IN PROGRESS",
      total: summary?.inProgressTasks ?? 0,
      icon: <MdOutlineEdit />,
      bg: "bg-[#f59e0b]",
    },
    {
      _id: "4",
      label: "TODOS",
      total: summary?.todoTasks ?? 0,
      icon: <FaArrowsToDot />,
      bg: "bg-[#be185d]",
    },
  ];

  const Card = ({ label, count, bg, icon }) => (
    <div className="w-full h-32 bg-white p-5 shadow-md rounded-md flex items-center justify-between">
      <div className="h-full flex flex-1 flex-col justify-between">
        <p className="text-base text-gray-600">{label}</p>
        <span className="text-2xl font-semibold">{count}</span>
        <span className="text-sm text-gray-400">Real Time</span>
      </div>
      <div
        className={clsx(
          "w-10 h-10 rounded-full flex items-center justify-center text-white",
          bg
        )}
      >
        {icon}
      </div>
    </div>
  );

  return (
    <div className="h-full py-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {stats.map(({ icon, bg, label, total, _id }) => (
          <Card key={_id} icon={icon} bg={bg} label={label} count={total} />
        ))}
      </div>

      <div className="w-full my-16">
        <ChartViewSwitcher
          data={chartData}
          tasks={summary?.recentTasks ?? []}
        />
      </div>

      <div className="w-full flex flex-col md:flex-row gap-4 2xl:gap-10 py-8">
        <TaskTable tasks={summary?.recentTasks ?? []} />
        <UserTable users={summary?.users ?? []} />
      </div>
    </div>
  );
};

export default Dashboard;




// // src/pages/dashboard.jsx
// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { Link } from "react-router-dom";
// import clsx from "clsx";
// import { toast } from "sonner";
// import Loader from "../components/Loader.jsx";
// import Chart from "../components/Chart.jsx";
// import api from "../utils/api.js";

// const STAGE_CONFIG = {
//   todo: { label: "To Do", color: "bg-purple-100 text-purple-700", icon: "📝" },
//   "in progress": { label: "In Progress", color: "bg-yellow-100 text-yellow-700", icon: "⏳" },
//   completed: { label: "Completed", color: "bg-green-100 text-green-700", icon: "✅" },
// };

// export default function Dashboard() {
//   const { user } = useSelector((state) => state.auth);
//   const isAdmin = user?.isAdmin;

//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const { data } = await api.get("/task/dashboard");
//         setStats(data);
//       } catch (err) {
//         toast.error("Failed to load dashboard stats");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStats();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <Loader />
//       </div>
//     );
//   }

//   return (
//     <div className="w-full">
//       {/* ── Welcome Banner ── */}
//       <div className="mb-6">
//         <h1 className="text-xl font-bold text-gray-800">
//           Welcome back, {user?.name?.split(" ")[0]} 👋
//         </h1>
//         <p className="text-sm text-gray-500 mt-0.5">
//           {isAdmin
//             ? "Here's an overview of all tasks."
//             : "Here's a summary of tasks assigned to you."}
//         </p>
//       </div>

//       {/* ── Stage Summary Cards ── */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
//         {Object.entries(STAGE_CONFIG).map(([stage, config]) => (
//           <Link
//             key={stage}
//             to={`/tasks?stage=${stage}`}
//             className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
//           >
//             <div className="flex items-center gap-3">
//               <span className="text-2xl">{config.icon}</span>
//               <div>
//                 <p className="text-xs text-gray-500">{config.label}</p>
//                 <p className="text-2xl font-bold text-gray-800">
//                   {stats?.tasks?.[stage] || 0}
//                 </p>
//               </div>
//             </div>
//             <div className="mt-2">
//               <span
//                 className={clsx(
//                   "text-xs font-medium px-2 py-0.5 rounded-full",
//                   config.color
//                 )}
//               >
//                 {stage}
//               </span>
//             </div>
//           </Link>
//         ))}
//       </div>

//       {/* ── Chart (admin) or simple bar (team member) ── */}
//       {stats?.graphData?.length > 0 && (
//         <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
//           <h2 className="text-sm font-semibold text-gray-700 mb-3">
//             Task Overview
//           </h2>
//           <Chart data={stats.graphData} />
//         </div>
//       )}

//       {/* ── Recent Tasks ── */}
//       <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
//         <div className="flex items-center justify-between mb-3">
//           <h2 className="text-sm font-semibold text-gray-700">
//             {isAdmin ? "Recent Tasks" : "My Recent Tasks"}
//           </h2>
//           <Link
//             to="/tasks"
//             className="text-xs text-blue-600 hover:underline"
//           >
//             View all →
//           </Link>
//         </div>

//         {stats?.last10Task?.length > 0 ? (
//           <div className="space-y-2">
//             {stats.last10Task.slice(0, 5).map((task) => (
//               <Link
//                 key={task._id}
//                 to={`/task/${task._id}`}
//                 className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 <span
//                   className={clsx(
//                     "w-2 h-2 rounded-full shrink-0",
//                     task.priority === "high"
//                       ? "bg-red-400"
//                       : task.priority === "medium"
//                       ? "bg-yellow-400"
//                       : "bg-blue-400"
//                   )}
//                 />
//                 <span className="text-sm text-gray-700 flex-1 truncate">
//                   {task.title}
//                 </span>
//                 <span
//                   className={clsx(
//                     "text-xs px-2 py-0.5 rounded-full capitalize shrink-0",
//                     STAGE_CONFIG[task.stage]?.color || "bg-gray-100 text-gray-500"
//                   )}
//                 >
//                   {task.stage}
//                 </span>
//               </Link>
//             ))}
//           </div>
//         ) : (
//           <p className="text-sm text-gray-400 py-4 text-center">
//             No tasks to show.
//           </p>
//         )}
//       </div>

//       {/* ── Users Table (Admin only) ── */}
//       {isAdmin && stats?.users?.length > 0 && (
//         <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
//           <div className="flex items-center justify-between mb-3">
//             <h2 className="text-sm font-semibold text-gray-700">Team Members</h2>
//             <Link to="/users" className="text-xs text-blue-600 hover:underline">
//               Manage →
//             </Link>
//           </div>
//           <div className="space-y-2">
//             {stats.users.slice(0, 5).map((u) => (
//               <div
//                 key={u._id}
//                 className="flex items-center gap-3 p-2 rounded-lg"
//               >
//                 <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
//                   {u.name?.[0]?.toUpperCase()}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium text-gray-700 truncate">
//                     {u.name}
//                   </p>
//                   <p className="text-xs text-gray-400 truncate">{u.title}</p>
//                 </div>
//                 <span
//                   className={clsx(
//                     "text-xs px-2 py-0.5 rounded-full font-medium shrink-0",
//                     u.isAdmin
//                       ? "bg-purple-100 text-purple-700"
//                       : "bg-gray-100 text-gray-600"
//                   )}
//                 >
//                   {u.isAdmin ? "Admin" : "Member"}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


