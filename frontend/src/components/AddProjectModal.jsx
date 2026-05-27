import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import api from "../utils/api";

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f59e0b", "#10b981", "#06b6d4", "#3b82f6",
];

const AddProjectModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#6366f1",
    status: "active",
    team: [],
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/user/get-team");
        setUsers(data.users || []); // ← fixed: was data || []
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsers();
  }, []);

  const toggleMember = (userId) => {
    setForm((prev) => ({
      ...prev,
      team: prev.team.includes(userId)
        ? prev.team.filter((id) => id !== userId)
        : [...prev.team, userId],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }
    try {
      setLoading(true);
      await api.post("/project", form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Project XYZ"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of the project..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    form.color === c ? "scale-125 ring-2 ring-offset-1 ring-gray-400" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            >
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Team */}
          {users.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Team Members
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1 border border-gray-100 rounded-xl p-2">
                {users.map((u) => (
                  <label
                    key={u._id}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.team.includes(u._id)}
                      onChange={() => toggleMember(u._id)}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm text-gray-700">{u.username}</span> {/* ← fixed: was u.name */}
                    <span className="text-xs text-gray-400 ml-auto">{u.email}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;