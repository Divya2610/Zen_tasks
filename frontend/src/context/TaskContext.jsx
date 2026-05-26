import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSelector } from "react-redux";
import api from "../utils/api";

const TaskContext = createContext(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Split a mixed assets array into two clean buckets:
 *   existingAssets – URL strings already stored on the server ("/uploads/…")
 *   files          – genuine File objects the user just picked
 */
const splitAssets = (assets = []) => {
  const existingAssets = [];
  const files = [];
  (assets || []).forEach((a) => {
    if (typeof a === "string") existingAssets.push(a);
    else if (a?.url) existingAssets.push(a.url);
    else if (a instanceof File) files.push(a);
  });
  return { existingAssets, files };
};

/**
 * Build the request payload.
 *
 * 1. No new files → plain JSON.
 *    Send `assets: existingAssets` (the field the backend controller reads).
 *
 * 2. Has new files → FormData.
 *    multer populates req.files; existingAssets sent as JSON string.
 */
const buildPayload = ({
  title,
  stage,
  date,
  priority,
  team = [],
  files = [],
  existingAssets = [],
}) => {
  if (files.length === 0) {
    return {
      data: { title, stage, date, priority, team, existingAssets },
      config: {},
    };
  }

  const fd = new FormData();
  fd.append("title",          title);
  fd.append("stage",          stage);
  fd.append("date",           date);
  fd.append("priority",       priority);
  fd.append("team",           JSON.stringify(team));
  fd.append("existingAssets", JSON.stringify(existingAssets));
  files.forEach((f) => fd.append("assets", f));

  return {
    data: fd,
    // ✅ FIX: setting Content-Type to undefined forces axios to drop any
    // instance-level "application/json" default and auto-generate the correct
    // "multipart/form-data; boundary=<...>" header that multer requires.
    config: { headers: { "Content-Type": undefined } },
  };
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const TaskProvider = ({ children }) => {
  const [tasks,         setTasks]         = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [notifications, setNotifications] = useState([]);

  // ✅ FIX: Read user from Redux so we never fire API calls without a token.
  // TaskProvider is now mounted inside Layout (auth-guarded), so `user` will
  // always be truthy here — but this secondary check is a safety net in case
  // the provider placement ever changes again.
  const { user } = useSelector((state) => state.auth);

  // ── fetchTasks ──────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    if (!user) return; // ✅ guard: never call without a token
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/tasks");
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── fetchNotifications ──────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!user) return; // ✅ guard: never call without a token
    try {
      const { data } = await api.get("/tasks/notifications");
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("[fetchNotifications]", err.response?.data || err.message);
    }
  }, [user]);

  // ── markNotificationsSeen ───────────────────────────────────────────────────
  const markNotificationsSeen = useCallback(async () => {
    try {
      await api.patch("/tasks/notifications/mark-seen");
      setNotifications([]);
    } catch (err) {
      console.error("[markNotificationsSeen]", err.response?.data || err.message);
    }
  }, []);

  // ✅ FIX: `user` in the dependency array means this re-runs when the user
  // logs in (user goes from null → object), and skips when user is null.
  useEffect(() => {
    if (!user) return;
    fetchTasks();
    fetchNotifications();
  }, [user, fetchTasks, fetchNotifications]);

  // ── createTask ──────────────────────────────────────────────────────────────
  const createTask = async (payload) => {
    try {
      const { existingAssets, files } = splitAssets(payload.assets);
      const { data: reqData, config } = buildPayload({
        ...payload,
        files,
        existingAssets,
      });
      const { data } = await api.post("/tasks", reqData, config);
      setTasks((prev) => [data.task, ...prev]);
      return true;
    } catch (err) {
      console.error("[createTask]", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to create task");
      return false;
    }
  };

  // ── updateTask ──────────────────────────────────────────────────────────────
  const updateTask = async (id, payload) => {
    try {
      const { existingAssets, files } = splitAssets(payload.assets);
      const { data: reqData, config } = buildPayload({
        ...payload,
        files,
        existingAssets,
      });
      const { data } = await api.patch(`/tasks/${id}`, reqData, config);
      setTasks((prev) => prev.map((t) => (t._id === id ? data : t)));
      return true;
    } catch (err) {
      console.error("[updateTask]", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to update task");
      return false;
    }
  };

  // ── updateTaskStatus ────────────────────────────────────────────────────────
  const updateTaskStatus = async (id, stage, files = []) => {
    try {
      const realFiles = files.filter((f) => f instanceof File);
      let reqData = { stage };

      if (realFiles.length > 0) {
        const fd = new FormData();
        fd.append("stage", stage);
        realFiles.forEach((f) => fd.append("assets", f));
        reqData = fd;
      }

      const { data } = await api.patch(`/tasks/${id}/status`, reqData);
      setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));
      fetchNotifications();
      return true;
    } catch (err) {
      console.error("[updateTaskStatus]", err.response?.data || err.message);
      return false;
    }
  };

  // ── deleteTask ──────────────────────────────────────────────────────────────
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      return true;
    } catch (err) {
      console.error("[deleteTask]", err.response?.data || err.message);
      return false;
    }
  };

  // ── addSubTask ──────────────────────────────────────────────────────────────
  const addSubTask = async (taskId, { title, date, tag, assignedTo = [] }) => {
    try {
      const { data } = await api.post(`/tasks/${taskId}/subtasks`, {
        title,
        date,
        tag: tag || "",
        assignedTo,
      });
      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, subTasks: data.subTasks } : t
        )
      );
      return true;
    } catch (err) {
      console.error("[addSubTask]", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to add sub-task");
      return false;
    }
  };

  // ── updateSubTask ───────────────────────────────────────────────────────────
  const updateSubTask = async (taskId, subTaskId, updates) => {
    try {
      const { data } = await api.patch(
        `/tasks/${taskId}/subtasks/${subTaskId}`,
        updates
      );
      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, subTasks: data.subTasks } : t
        )
      );
      return true;
    } catch (err) {
      console.error("[updateSubTask]", err.response?.data || err.message);
      return false;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        addSubTask,
        updateSubTask,
        notifications,
        fetchNotifications,
        markNotificationsSeen,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used inside <TaskProvider>");
  return ctx;
};
