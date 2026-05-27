import React from "react";
import {
  MdDashboard,
  MdOutlineAddTask,
  MdOutlinePendingActions,
  MdSettings,
  MdTaskAlt,
  MdFolderOpen,
} from "react-icons/md";
import { FaTasks, FaTrashAlt, FaUsers } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { setOpenSidebar } from "../redux/slices/authSlice";
import clsx from "clsx";
import { isAdminUser } from "../utils/role";

// ── Nav links visible to ALL users ───────────────────────────────────────────
const commonLinks = [
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
    label: "Projects",
    link: "projects",
    icon: <MdFolderOpen />,  // ✅ Fixed: was MdSettings (wrong icon)
  },
];

// ── Nav links visible only to ADMINS ─────────────────────────────────────────
const adminOnlyLinks = [
  {
    label: "Team",
    link: "team",
    icon: <FaUsers />,
  },
  // {
  //   label: "Trash",
  //   link: "trashed",
  //   icon: <FaTrashAlt />,
  // },
];

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = isAdminUser(user);

  const dispatch = useDispatch();
  const location = useLocation();

  const path = location.pathname.split("/")[1];

  // All users see commonLinks; admins also see adminOnlyLinks
  const sidebarLinks = isAdmin
    ? [...commonLinks, ...adminOnlyLinks]
    : commonLinks;

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
        <span className="hover:text-[#2564ed]">{el.label}</span>
      </Link>
    );
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 p-5">
      {/* Logo */}
      <h1 className="flex gap-1 items-center">
        <p className="bg-blue-600 p-2 rounded-full">
          <MdOutlineAddTask className="text-white text-2xl font-black" />
        </p>
        <span className="text-2xl font-bold text-black">ZenTasks</span>
      </h1>

      {/* Role badge */}
      <div
        className={clsx(
          "rounded-lg border px-3 py-3 text-sm",
          isAdmin
            ? "border-blue-100 bg-blue-50 text-blue-800"
            : "border-emerald-100 bg-emerald-50 text-emerald-800"
        )}
      >
        <p className="font-semibold">
          {isAdmin ? "Admin login" : "Team member login"}
        </p>
        <p className="mt-1 text-xs opacity-80">
          {isAdmin
            ? "Assign, edit, delete, add sub-tasks, and attach files."
            : "View assigned tasks, update status, and upload files."}
        </p>
      </div>

      {/* Nav links */}
      <div className="flex-1 flex flex-col gap-y-5 py-8">
        {sidebarLinks.map((link) => (
          <NavLink el={link} key={link.label} />
        ))}
      </div>

      {/* Settings button */}
      <div>
        <button className="w-full flex gap-2 p-2 items-center text-lg text-gray-800">
          <MdSettings />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;



// import React from "react";
// import {
//   MdDashboard,
//   MdOutlineAddTask,
//   MdOutlinePendingActions,
//   MdSettings,
//   MdTaskAlt,
// } from "react-icons/md";
// import { FaTasks, FaTrashAlt, FaUsers } from "react-icons/fa";
// import { useDispatch, useSelector } from "react-redux";
// import { Link, useLocation } from "react-router-dom";
// import { setOpenSidebar } from "../redux/slices/authSlice";
// import clsx from "clsx";
// import { isAdminUser } from "../utils/role";

// const linkData = [
//   {
//     label: "Dashboard",
//     link: "dashboard",
//     icon: <MdDashboard />,
//   },
//   {
//     label: "Tasks",
//     link: "tasks",
//     icon: <FaTasks />,
//   },
//   {
//     label: "Completed",
//     link: "completed/completed",
//     icon: <MdTaskAlt />,
//   },
//   {
//     label: "In Progress",
//     link: "in-progress/in progress",
//     icon: <MdOutlinePendingActions />,
//   },
//   {
//     label: "To Do",
//     link: "todo/todo",
//     icon: <MdOutlinePendingActions />,
//   },
//   {
//     label: "Team",
//     link: "team",
//     icon: <FaUsers />,
//   },
//   {
//     label: "Projects",
//     link: "projects",
//     icon: <MdSettings />,
//   },
// ];

// const Sidebar = () => {
//   const { user } = useSelector((state) => state.auth);
//   const isAdmin = isAdminUser(user);

//   const dispatch = useDispatch();
//   const location = useLocation();

//   const path = location.pathname.split("/")[1];

//   const sidebarLinks = isAdmin ? linkData : linkData.slice(0, 5);


//   const closeSidebar = () => {
//     dispatch(setOpenSidebar(false));
//   };

//   const NavLink = ({ el }) => {
//     return (
//       <Link
//         to={el.link}
//         onClick={closeSidebar}
//         className={clsx(
//           "w-full lg:w-3/4 flex gap-2 px-3 py-2 rounded-full items-center text-gray-800 text-base hover:bg-[#2564ed2d]",
//           path === el.link.split("/")[0] ? "bg-blue-700 text-neutral-100" : ""
//         )}
//       >
//         {el.icon}
//         <span className='hover:text-[#2564ed]'>{el.label}</span>
//       </Link>
//     );
//   };
//   return (
//     <div className='w-full  h-full flex flex-col gap-6 p-5'>
//       <h1 className='flex gap-1 items-center'>
//         <p className='bg-blue-600 p-2 rounded-full'>
//           <MdOutlineAddTask className='text-white text-2xl font-black' />
//         </p>
//         <span className='text-2xl font-bold text-black'>ZenTasks</span>
//       </h1>

//       <div className={clsx(
//         "rounded-lg border px-3 py-3 text-sm",
//         isAdmin
//           ? "border-blue-100 bg-blue-50 text-blue-800"
//           : "border-emerald-100 bg-emerald-50 text-emerald-800"
//       )}>
//         <p className="font-semibold">
//           {isAdmin ? "Admin login" : "Team member login"}
//         </p>
//         <p className="mt-1 text-xs opacity-80">
//           {isAdmin
//             ? "Assign, edit, delete, add sub-tasks, and attach files."
//             : "View assigned tasks, update status, and upload files."}
//         </p>
//       </div>

//       <div className='flex-1 flex flex-col gap-y-5 py-8'>
//         {sidebarLinks.map((link) => (
//           <NavLink el={link} key={link.label} />
//         ))}
//       </div>

//       <div className=''>
//         <button className='w-full flex gap-2 p-2 items-center text-lg text-gray-800'>
//           <MdSettings />
//           <span>Settings</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
