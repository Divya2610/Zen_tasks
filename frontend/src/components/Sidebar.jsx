// // src/components/Sidebar.jsx
// import React from "react";
// import { Link, useLocation } from "react-router-dom";
// import { useSelector } from "react-redux";
// import clsx from "clsx";

// // ── Nav items visible to ALL users ───────────────────────────────────────────
// const COMMON_LINKS = [
//   {
//     label: "Dashboard",
//     path: "/dashboard",
//     icon: "🏠",
//   },
//   {
//     label: "My Tasks",
//     path: "/tasks",
//     icon: "✅",
//   },
// ];

// // ── Nav items visible only to ADMINS ─────────────────────────────────────────
// const ADMIN_LINKS = [
//   {
//     label: "Users",
//     path: "/users",
//     icon: "👥",
//   },
//   {
//     label: "Trash",
//     path: "/trashed",
//     icon: "🗑️",
//   },
// ];

// export default function Sidebar() {
//   const { user } = useSelector((state) => state.auth);
//   const isAdmin = user?.isAdmin;
//   const location = useLocation();

//   const navLinks = isAdmin ? [...COMMON_LINKS, ...ADMIN_LINKS] : COMMON_LINKS;

//   return (
//     <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col py-6 px-4 shadow-sm">
//       {/* Logo */}
//       <div className="mb-8 px-2">
//         <span className="text-xl font-bold text-blue-600">⚡ ZenTasks</span>
//       </div>

//       {/* User Info */}
//       <div className="mb-6 px-2">
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
//             {user?.name?.[0]?.toUpperCase() || "U"}
//           </div>
//           <div className="min-w-0">
//             <p className="text-sm font-semibold text-gray-800 truncate">
//               {user?.name}
//             </p>
//             <p className="text-xs text-gray-400 capitalize">
//               {isAdmin ? "Admin" : "Team Member"}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Navigation */}
//       <nav className="flex flex-col gap-1 flex-1">
//         {navLinks.map(({ label, path, icon }) => {
//           const active =
//             location.pathname === path ||
//             (path !== "/dashboard" && location.pathname.startsWith(path));

//           return (
//             <Link
//               key={path}
//               to={path}
//               className={clsx(
//                 "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
//                 active
//                   ? "bg-blue-50 text-blue-700"
//                   : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
//               )}
//             >
//               <span className="text-base">{icon}</span>
//               {label}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* Bottom: team member notice */}
//       {!isAdmin && (
//         <div className="mt-4 px-2">
//           <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-600">
//             <p className="font-semibold mb-0.5">Team Member</p>
//             <p className="text-blue-500">
//               You can view and update the status of tasks assigned to you, and
//               upload documents.
//             </p>
//           </div>
//         </div>
//       )}
//     </aside>
//   );
// }


import React from "react";
import {
  MdDashboard,
  MdOutlineAddTask,
  MdOutlinePendingActions,
  MdSettings,
  MdTaskAlt,
} from "react-icons/md";
import { FaTasks, FaTrashAlt, FaUsers } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { setOpenSidebar } from "../redux/slices/authSlice";
import clsx from "clsx";
import { isAdminUser } from "../utils/role";

const linkData = [
  {
    label: "Dashboard",
    link: "dashboard",
    icon: <MdDashboard />,
  },
  {
    label: "Tasks",
    link: "tasks",
    icon: <FaTasks />,
  },
  {
    label: "Completed",
    link: "completed/completed",
    icon: <MdTaskAlt />,
  },
  {
    label: "In Progress",
    link: "in-progress/in progress",
    icon: <MdOutlinePendingActions />,
  },
  {
    label: "To Do",
    link: "todo/todo",
    icon: <MdOutlinePendingActions />,
  },
  {
    label: "Team",
    link: "team",
    icon: <FaUsers />,
  },
  {
    label: "Projects",
    link: "projects",
    icon: <MdSettings />,
  },
];

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = isAdminUser(user);

  const dispatch = useDispatch();
  const location = useLocation();

  const path = location.pathname.split("/")[1];

  const sidebarLinks = isAdmin ? linkData : linkData.slice(0, 5);


  const closeSidebar = () => {
    dispatch(setOpenSidebar(false));
  };

  const NavLink = ({ el }) => {
    return (
      <Link
        to={el.link}
        onClick={closeSidebar}
        className={clsx(
          "w-full lg:w-3/4 flex gap-2 px-3 py-2 rounded-full items-center text-gray-800 text-base hover:bg-[#2564ed2d]",
          path === el.link.split("/")[0] ? "bg-blue-700 text-neutral-100" : ""
        )}
      >
        {el.icon}
        <span className='hover:text-[#2564ed]'>{el.label}</span>
      </Link>
    );
  };
  return (
    <div className='w-full  h-full flex flex-col gap-6 p-5'>
      <h1 className='flex gap-1 items-center'>
        <p className='bg-blue-600 p-2 rounded-full'>
          <MdOutlineAddTask className='text-white text-2xl font-black' />
        </p>
        <span className='text-2xl font-bold text-black'>ZenTasks</span>
      </h1>

      <div className={clsx(
        "rounded-lg border px-3 py-3 text-sm",
        isAdmin
          ? "border-blue-100 bg-blue-50 text-blue-800"
          : "border-emerald-100 bg-emerald-50 text-emerald-800"
      )}>
        <p className="font-semibold">
          {isAdmin ? "Admin login" : "Team member login"}
        </p>
        <p className="mt-1 text-xs opacity-80">
          {isAdmin
            ? "Assign, edit, delete, add sub-tasks, and attach files."
            : "View assigned tasks, update status, and upload files."}
        </p>
      </div>

      <div className='flex-1 flex flex-col gap-y-5 py-8'>
        {sidebarLinks.map((link) => (
          <NavLink el={link} key={link.label} />
        ))}
      </div>

      <div className=''>
        <button className='w-full flex gap-2 p-2 items-center text-lg text-gray-800'>
          <MdSettings />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
