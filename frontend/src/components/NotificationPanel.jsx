import React, { useState, useRef, useEffect } from "react";
import { MdOutlineNotifications } from "react-icons/md";
import { useSelector } from "react-redux";

// ---------------------------------------------------------------------------
// Sample shape – replace with real data from your Redux store or an API call
// ---------------------------------------------------------------------------
const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    type: "task",
    message: "You have been assigned a new task: 'Fix login bug'",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    type: "comment",
    message: "Alex commented on 'Dashboard redesign'",
    time: "15 min ago",
    read: false,
  },
  {
    id: 3,
    type: "alert",
    message: "Task 'API integration' is overdue",
    time: "1 hr ago",
    read: true,
  },
  {
    id: 4,
    type: "task",
    message: "Task 'Write unit tests' marked as complete",
    time: "3 hrs ago",
    read: true,
  },
];

// Icon colour per notification type
const TYPE_STYLES = {
  task:    "bg-blue-100 text-blue-600",
  comment: "bg-purple-100 text-purple-600",
  alert:   "bg-red-100 text-red-600",
};

const NotificationPanel = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const clearAll = () => setNotifications([]);

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <MdOutlineNotifications className="text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            {notifications.length > 0 && (
              <div className="flex gap-2 text-xs text-blue-500">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="hover:underline">
                    Mark all read
                  </button>
                )}
                <button onClick={clearAll} className="hover:underline text-gray-400">
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* List */}
          <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <li className="py-10 text-center text-sm text-gray-400">
                You're all caught up! 🎉
              </li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !n.read ? "bg-blue-50/40" : ""
                  }`}
                >
                  {/* Type badge */}
                  <span
                    className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      TYPE_STYLES[n.type] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {n.type === "task" ? "T" : n.type === "comment" ? "C" : "!"}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${
                        !n.read ? "text-gray-800 font-medium" : "text-gray-600"
                      }`}
                    >
                      {n.message}
                    </p>
                    <span className="text-xs text-gray-400 mt-0.5 block">
                      {n.time}
                    </span>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <span className="mt-2 flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </li>
              ))
            )}
          </ul>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 text-center">
              <button className="text-xs text-blue-500 hover:underline">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
