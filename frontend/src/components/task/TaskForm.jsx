/**
 * TaskForm.jsx
 *
 * Used for both CREATE (no `task` prop) and EDIT (`task` prop present).
 * Admin only — team members cannot create tasks.
 *
 * Fixes applied:
 * 1. Team picker replaced with searchable UserSelectDropdown (avatar + search).
 * 2. File attachments correctly passed via FormData through TaskContext.
 * 3. Priority values: "high" | "medium" | "low" — matches Mongoose enum.
 * 4. Stage hidden on CREATE (always "todo"); shown on EDIT.
 * 5. Self-exclusion: logged-in admin is filtered from the user list.
 */

import React, { useState, useEffect, useRef, Fragment } from "react";
import { useSelector } from "react-redux";
import {
  MdClose,
  MdInsertDriveFile,
  MdCloudUpload,
  MdAttachFile,
  MdSearch,
  MdCheck,
  MdKeyboardArrowDown,
  MdOutlineDeleteOutline,
} from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import clsx from "clsx";
import { useTasks } from "../../context/TaskContext";
import { PRIORITY_OPTIONS, STAGE_OPTIONS, formatDate, BGS } from "../../utils";
import Button from "../Button";
import api from "../../utils/api";
import { getAssetHref, getAssetKeepUrl, getAssetName } from "../../utils/assets";

// ─── Searchable multi-select user dropdown ────────────────────────────────────

const UserSelectDropdown = ({ allUsers = [], selected = [], onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = allUsers.filter((u) => {
    const q = query.toLowerCase();
    const name = (u.username || u.name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const toggle = (id) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );
  };

  const selectedUsers = allUsers.filter((u) =>
    selected.includes(u._id || u.id)
  );

  const initials = (u) =>
    (u.username || u.name || "?")
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-sm bg-white transition-all",
          open
            ? "border-blue-500 ring-2 ring-blue-100"
            : "border-gray-300 hover:border-gray-400"
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedUsers.length === 0 ? (
            <span className="text-gray-400">Select team members…</span>
          ) : (
            <>
              <div className="flex -space-x-1.5">
                {selectedUsers.slice(0, 3).map((u, i) => (
                  <div
                    key={u._id || u.id}
                    title={u.username || u.name}
                    className={clsx(
                      "w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white",
                      BGS[i % BGS.length]
                    )}
                  >
                    {initials(u)}
                  </div>
                ))}
                {selectedUsers.length > 3 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[9px] font-semibold text-gray-600">
                    +{selectedUsers.length - 3}
                  </div>
                )}
              </div>
              <span className="text-gray-600 text-xs truncate">
                {selectedUsers.length} member
                {selectedUsers.length !== 1 ? "s" : ""} selected
              </span>
            </>
          )}
        </div>
        <MdKeyboardArrowDown
          className={clsx(
            "text-gray-400 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <MdSearch className="text-gray-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search members…"
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")}>
                  <MdClose size={14} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <ul className="max-h-52 overflow-y-auto divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <li className="px-4 py-5 text-center text-sm text-gray-400">
                No members found
              </li>
            ) : (
              filtered.map((u, idx) => {
                const uid = u._id || u.id;
                const isSel = selected.includes(uid);
                return (
                  <li key={uid}>
                    <button
                      type="button"
                      onClick={() => toggle(uid)}
                      className={clsx(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                        isSel ? "bg-blue-50" : "hover:bg-gray-50"
                      )}
                    >
                      <div
                        className={clsx(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0",
                          BGS[idx % BGS.length]
                        )}
                      >
                        {initials(u)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {u.username || u.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      <div
                        className={clsx(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                          isSel ? "bg-blue-500 border-blue-500" : "border-gray-300"
                        )}
                      >
                        {isSel && <MdCheck className="text-white" size={12} />}
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer */}
          {selected.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {selected.length} selected
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── TaskForm ─────────────────────────────────────────────────────────────────

const TaskForm = ({ open, setOpen, task = null, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);
  const { createTask, updateTask } = useTasks();
  const isEdit = Boolean(task);
  const fileInputRef = useRef(null);

  // ── Form state ──
  const [title, setTitle]       = useState("");
  const [priority, setPriority] = useState("low");
  const [stage, setStage]       = useState("todo");
  const [date, setDate]         = useState("");
  const [team, setTeam]         = useState([]);           // selected user IDs

  // Projects hierarchy selection for Create Task
  // project -> objective -> motivation
  const [projectName, setProjectName] = useState("");
  const [objectiveName, setObjectiveName] = useState("");
  const [motivationName, setMotivationName] = useState("");

  const [newFiles, setNewFiles] = useState([]);           // NEW File objects
  const [existingAssets, setExistingAssets] = useState([]); // URL strings from server


  // ── Users list ──
  const [users, setUsers]     = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Populate form when editing / reset on create
  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setPriority(task.priority || "low");
      setStage(task.stage || "todo");
      setDate(task.date ? formatDate(new Date(task.date), "input") : "");
      setTeam((task.team || []).map((m) => m._id || m));
      setExistingAssets(task.assets || []);
      setNewFiles([]);
    } else {
      setTitle("");
      setPriority("low");
      setStage("todo");
      setDate("");
      setTeam([]);
      setNewFiles([]);
      setExistingAssets([]);
    }
  }, [task, open]);

  // Fetch all users whenever dialog opens
  useEffect(() => {
    if (!open) return;
    api
      .get("/users")
      .then(({ data }) => {
        // Exclude the logged-in admin from the picker
        const selfId = user?._id || user?.id;
        const others = (data || []).filter(
          (u) => (u._id || u.id) !== selfId
        );
        setUsers(others);
      })
      .catch((err) => console.error("[TaskForm] Failed to load users:", err));
  }, [open, user]);

  // ── File helpers ──
  const handleFileSelect = (e) => {
    setNewFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    e.target.value = "";
  };

  const removeNewFile = (idx) =>
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));

  const removeExistingAsset = (url) =>
    setExistingAssets((prev) => prev.filter((a) => getAssetKeepUrl(a) !== url));

  // ── Projects tree (static placeholder) ────────────────────────────────
  // TODO: Replace with backend-driven Projects/Objectives/Motivations.
  const PROJECTS_TREE = [
    {
      name: "Project Alpha",
      objectives: [
        {
          name: "Objective 1",
          motivations: ["Motivation A", "Motivation B", "Motivation C"],
        },
        {
          name: "Objective 2",
          motivations: ["Motivation D", "Motivation E"],
        },
      ],
    },
    {
      name: "Project Beta",
      objectives: [
        {
          name: "Objective X",
          motivations: ["Motivation 1", "Motivation 2"],
        },
      ],
    },
  ];

  const getObjectives = (tree, project) => {
    const p = (tree || []).find((x) => x.name === project);
    return p?.objectives || [];
  };

  const getMotivations = (tree, project, objective) => {
    const objectives = getObjectives(tree, project);
    const obj = (objectives || []).find((x) => x.name === objective);
    return obj?.motivations || [];
  };

  // ── Submit ──
  // FIX: pass assets as mixed array — TaskContext.splitAssets() separates
  // URL strings (existingAssets) from File objects (newFiles) before building
  // FormData. This ensures multer only ever receives real File objects.
  const handleSubmit = async () => {
    if (!title.trim()) return alert("Task title is required.");
    if (!date)         return alert("Deadline is required.");
    if (!priority)     return alert("Priority is required.");

    setIsSaving(true);

    const payload = {
      title:    title.trim(),
      stage:    isEdit ? stage : "todo",
      date,
      priority,
      team,
      // mixed array: existing URL strings + new File objects
      // TaskContext.splitAssets() will separate them correctly
      assets: [...existingAssets, ...newFiles],
    };

    const success = isEdit
      ? await updateTask(task._id, payload)
      : await createTask(payload);

    setIsSaving(false);

    if (success) {
      setNewFiles([]);
      setOpen(false);
      onSuccess?.();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? "Edit Task" : "Create Task"}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdClose size={22} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          {/* Assign Task To — searchable dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Task To
            </label>
            <UserSelectDropdown
              allUsers={users}
              selected={team}
              onChange={setTeam}
            />
          </div>

          {/* Project / Objective / Motivation */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <select
                value={projectName}
                onChange={(e) => {
                  const v = e.target.value;
                  setProjectName(v);
                  setObjectiveName("");
                  setMotivationName("");
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select project…</option>
                {(PROJECTS_TREE || []).map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objective
              </label>
              <select
                value={objectiveName}
                onChange={(e) => {
                  const v = e.target.value;
                  setObjectiveName(v);
                  setMotivationName("");
                }}
                disabled={!projectName}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              >
                <option value="">Select objective…</option>
                {(getObjectives(PROJECTS_TREE, projectName) || []).map((o) => (
                  <option key={o.name} value={o.name}>{o.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivation
              </label>
              <select
                value={motivationName}
                onChange={(e) => setMotivationName(e.target.value)}
                disabled={!objectiveName}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              >
                <option value="">Select motivation…</option>
                {(getMotivations(PROJECTS_TREE, projectName, objectiveName) || []).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>


          {/* Stage — EDIT mode only */}
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
              >
                {STAGE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Deadline + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority Level <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assets / Attachments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <MdAttachFile className="text-blue-500" />
                Assets / Attachments
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-blue-600 border border-blue-300 rounded px-2 py-1 hover:bg-blue-50 transition-colors flex items-center gap-1"
              >
                <IoMdAdd /> Add Files
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
              onChange={handleFileSelect}
            />

            {/* Existing assets (edit mode) — with remove option */}
            {isEdit && existingAssets.length > 0 && (
              <div className="mb-2 space-y-1">
                <p className="text-xs text-gray-400 mb-1">Existing files:</p>
                {existingAssets.map((asset, i) => {
                  const url = getAssetKeepUrl(asset);
                  return (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded px-2 py-1.5 border border-gray-200"
                  >
                    <MdInsertDriveFile className="text-blue-400 shrink-0" />
                    <a
                      href={getAssetHref(asset)}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate flex-1 text-blue-600 hover:underline"
                    >
                      {getAssetName(asset)}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeExistingAsset(url)}
                      className="text-gray-400 hover:text-red-500 shrink-0 transition-colors"
                      title="Remove"
                    >
                      <MdOutlineDeleteOutline size={14} />
                    </button>
                  </div>
                  );
                })}
              </div>
            )}

            {/* New files staged for upload */}
            {newFiles.length > 0 ? (
              <div className="space-y-2">
                {newFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-blue-50 rounded-lg p-2 border border-blue-100"
                  >
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <MdInsertDriveFile className="text-2xl text-blue-400 shrink-0" />
                    )}
                    <span className="text-sm text-gray-600 flex-1 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNewFile(idx)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <MdClose />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-gray-400">
                  {existingAssets.length + newFiles.length} file(s) total ·{" "}
                  {newFiles.length} new
                </p>
              </div>
            ) : existingAssets.length === 0 ? (
              <div
                className="text-center py-5 cursor-pointer border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <MdCloudUpload className="text-3xl text-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-400">
                  Click "Add Files" or drag files here
                </p>
                <p className="text-xs text-gray-300">
                  Images, PDFs, Docs (max 10 MB each)
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <Button
            type="button"
            label={
              isSaving
                ? isEdit ? "Saving..." : "Creating..."
                : isEdit ? "Save Changes" : "Create Task"
            }
            onClick={handleSubmit}
            className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          />
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
