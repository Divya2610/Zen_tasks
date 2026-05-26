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


import { Transition } from "@headlessui/react";
import clsx from "clsx";
import { Fragment, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TaskDetails from "./pages/TaskDetails";
import Tasks from "./pages/Tasks";
import Trash from "./pages/Trash";
import Users from "./pages/Users";
import Dashboard from "./pages/dashboard";
import { setOpenSidebar } from "./redux/slices/authSlice";
import { TaskProvider } from "./context/TaskContext";

// ─────────────────────────────────────────────────────────────────────────────
// Layout — only rendered when the user IS authenticated.
// TaskProvider lives HERE so fetchTasks / fetchNotifications only fire
// after the auth guard passes — never on the login/signup pages.
// Previously TaskProvider was in <App>, causing both calls to fire immediately
// on every page load (including /log-in) with no token → 401 Unauthorized.
// ─────────────────────────────────────────────────────────────────────────────
function Layout() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/log-in" state={{ from: location }} replace />;
  }

  return (
    // ✅ FIX: TaskProvider is now INSIDE the auth guard.
    // It only mounts (and makes API calls) when `user` is truthy,
    // so the token cookie is guaranteed to exist.
    <TaskProvider>
      <div className="w-full h-screen flex flex-col md:flex-row">
        <div className="w-1/5 h-screen bg-white sticky top-0 hidden md:block">
          <Sidebar />
        </div>

        <MobileSidebar />

        <div className="flex-1 overflow-y-auto">
          <Navbar />
          <div className="p-4 2xl:px-10">
            <Outlet />
          </div>
        </div>
      </div>
    </TaskProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MobileSidebar — unchanged
// ─────────────────────────────────────────────────────────────────────────────
const MobileSidebar = () => {
  const { isSidebarOpen } = useSelector((state) => state.auth);
  const mobileMenuRef = useRef(null);
  const dispatch = useDispatch();

  const closeSidebar = () => {
    dispatch(setOpenSidebar(false));
  };

  return (
    <>
      <Transition
        show={isSidebarOpen}
        as={Fragment}
        enter="transition-opacity duration-700"
        enterFrom="opacity-x-10"
        enterTo="opacity-x-100"
        leave="transition-opacity duration-700"
        leaveFrom="opacity-x-100"
        leaveTo="opacity-x-0"
      >
        {(ref) => (
          <div
            ref={(node) => (mobileMenuRef.current = node)}
            className={clsx(
              "md:hidden w-full h-full bg-black/40 transition-all duration-700 transform",
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            )}
            onClick={() => closeSidebar()}
          >
            <div className="bg-white w-3/4 h-full">
              <div className="w-full flex justify-end px-5 mt-5">
                <button
                  onClick={() => closeSidebar()}
                  className="flex justify-end items-end"
                >
                  <IoClose size={25} />
                </button>
              </div>
              <div className="-mt-10">
                <Sidebar />
              </div>
            </div>
          </div>
        )}
      </Transition>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// App — TaskProvider is NO LONGER here.
// It has been moved inside <Layout> above.
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  return (
    <main className="w-full min-h-screen bg-[#f3f4f6]">
      <Routes>
        {/* Protected routes — Layout handles auth guard + TaskProvider */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/completed/:status" element={<Tasks />} />
          <Route path="/in-progress/:status" element={<Tasks />} />
          <Route path="/todo/:status" element={<Tasks />} />
          <Route path="/team" element={<Users />} />
          <Route path="/trashed" element={<Trash />} />
          <Route path="/task/:id" element={<TaskDetails />} />
        </Route>

        {/* Public routes — TaskProvider is NOT mounted here */}
        <Route path="/log-in" element={<Login />} />
        <Route path="/sign-up" element={<Signup />} />

        {/* Catch-all → /dashboard (Layout redirects to /log-in if unauthenticated) */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Toaster richColors />
    </main>
  );
}

export default App;
