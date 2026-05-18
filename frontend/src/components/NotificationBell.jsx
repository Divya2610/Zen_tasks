import { useState, useEffect, useRef, useCallback } from "react";
import { IoNotificationsOutline }                   from "react-icons/io5";
import { MdTaskAlt, MdOutlineUpdate }               from "react-icons/md";
import moment                                       from "moment";
import clsx                                         from "clsx";
import api                                          from "../utils/api";
import useSocket                                    from "../hooks/useSocket";
import { useSelector }                              from "react-redux"; // adjust to your auth store

const TYPE_META = {
  task_assigned: {
    icon:  <MdTaskAlt className="text-blue-500 text-lg" />,
    label: "Task assigned",
  },
  status_updated: {
    icon:  <MdOutlineUpdate className="text-amber-500 text-lg" />,
    label: "Status updated",
  },
};

const NotificationBell = () => {
  const { user }           = useSelector((s) => s.auth); // your auth slice
  const [open, setOpen]    = useState(false);
  const [data, setData]    = useState({ notifications: [], unreadCount: 0 });
  const [loading, setLoading] = useState(false);
  const ref                = useRef(null);

  // ── Fetch from API ──────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { data: res } = await api.get("/notifications");
      setData(res);
    } catch (_) {
      // silently fail — bell is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── Real-time: new notification arrives via socket ───────────────────────
  useSocket({
    userId: user?._id,
    onNotification: (notification) => {
      setData((prev) => ({
        notifications: [notification, ...prev.notifications].slice(0, 30),
        unreadCount:   prev.unreadCount + 1,
      }));
    },
  });

  // ── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Mark one as read ─────────────────────────────────────────────────────
  const markRead = async (id) => {
    setData((prev) => ({
      notifications: prev.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, prev.unreadCount - 1),
    }));
    await api.patch(`/notifications/${id}/read`).catch(() => {});
  };

  // ── Mark all as read ─────────────────────────────────────────────────────
  const markAllRead = async () => {
    setData((prev) => ({
      notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
    await api.patch("/notifications/read-all").catch(() => {});
  };

  return (
    <div ref={ref} className="relative">
      {/* ── Bell button ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <IoNotificationsOutline className="text-2xl text-gray-600" />
        {data.unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
            {data.unreadCount > 99 ? "99+" : data.unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ────────────────────────────────────────────────────── */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[360px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">
              Notifications
              {data.unreadCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {data.unreadCount} new
                </span>
              )}
            </h3>
            {data.unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
            {loading && (
              <div className="py-10 text-center text-sm text-gray-400">Loading…</div>
            )}

            {!loading && data.notifications.length === 0 && (
              <div className="py-10 text-center">
                <IoNotificationsOutline className="text-4xl text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            )}

            {!loading &&
              data.notifications.map((n) => {
                const meta = TYPE_META[n.type] || TYPE_META.task_assigned;
                return (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && markRead(n._id)}
                    className={clsx(
                      "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                      n.isRead
                        ? "hover:bg-gray-50"
                        : "bg-blue-50/60 hover:bg-blue-50"
                    )}
                  >
                    {/* Icon */}
                    <div className="mt-0.5 w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                      {meta.icon}
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <p className={clsx("text-sm leading-snug", n.isRead ? "text-gray-600" : "text-gray-900 font-medium")}>
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {moment(n.createdAt).fromNow()}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!n.isRead && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
          </div>

          {/* Footer */}
          {data.notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 text-center">
              <button
                onClick={fetchNotifications}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
