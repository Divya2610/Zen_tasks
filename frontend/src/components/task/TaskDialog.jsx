/**
 * TaskDialog.jsx
 *
 * Trigger: three-dot (⋮) button on the task card.
 * Dropdown options:
 *   1. Edit         → opens the inline edit modal
 *   2. Add Sub-Task → opens the AddSubTask modal
 *   3. Delete       → opens a confirmation dialog
 *
 * Fixes vs previous version:
 *  - Restored the three-dot dropdown (was replaced with a bare pencil icon)
 *  - Added `accept` attribute to the file input so .jsx / code files
 *    cannot be selected (those caused "File type .jsx is not allowed" 500s)
 */

import React, { useState, useRef, useEffect, Fragment } from "react";
import clsx from "clsx";
import { Dialog, Transition } from "@headlessui/react";
import {
  MdOutlineEdit,
  MdCheck,
  MdSearch,
  MdClose,
  MdKeyboardArrowDown,
  MdAttachFile,
  MdOutlineDeleteOutline,
  MdAdd,
} from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import { useTasks } from "../../context/TaskContext";
import { BGS } from "../../utils";
import api from "../../utils/api";
import AddSubTask from "./AddSubTask";
import ConfirmatioDialog from "../Dialogs";

// Must match the backend fileFilter in task.route.js
const ACCEPTED_FILES =
  ".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip";

// ─── Searchable multi-select user dropdown ─────────────────────────────────────
const UserSelectDropdown = ({ allUsers = [], selected = [], onChange }) => {
  const [open,  setOpen]  = useState(false);
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
    return (
      (u.username || u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  });

  const toggle = (id) =>
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );

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

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
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

          <ul className="max-h-52 overflow-y-auto divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <li className="px-4 py-5 text-center text-sm text-gray-400">
                No members found
              </li>
            ) : (
              filtered.map((u, idx) => {
                const uid   = u._id || u.id;
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

          {selected.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500">{selected.length} selected</span>
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

// ─── Main component ───────────────────────────────────────────────────────────

const PRIORITIES = ["high", "medium", "low"];
const STAGES     = ["todo", "in progress", "completed"];

const TaskDialog = ({ task }) => {
  const { updateTask, deleteTask } = useTasks();

  // ── Dropdown ──
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ── Which modal is open ──
  const [editOpen,    setEditOpen]    = useState(false);
  const [subTaskOpen, setSubTaskOpen] = useState(false);
  const [deleteOpen,  setDeleteOpen]  = useState(false);

  // ── Edit form ──
  const [saving,       setSaving]       = useState(false);
  const [title,        setTitle]        = useState(task?.title    ?? "");
  const [stage,        setStage]        = useState(task?.stage    ?? "todo");
  const [priority,     setPriority]     = useState(task?.priority ?? "medium");
  const [date,         setDate]         = useState(
    task?.date ? new Date(task.date).toISOString().split("T")[0] : ""
  );
  const [selectedTeam, setSelectedTeam] = useState(
    () => (task?.team ?? []).map((m) => (typeof m === "object" ? m._id : m))
  );
  const [allUsers,  setAllUsers]  = useState([]);
  const [assets,    setAssets]    = useState(task?.assets ?? []);   // existing URLs
  const [newFiles,  setNewFiles]  = useState([]);                   // new File objects
  const fileInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch all users when edit dialog opens
  useEffect(() => {
    if (!editOpen) return;
    api
      .get("/users")
      .then(({ data }) => setAllUsers(data || []))
      .catch((err) => console.error("[TaskDialog] Failed to load users:", err));
  }, [editOpen]);

  // Reset edit form each time the edit dialog opens
  const handleOpenEdit = () => {
    setTitle(task?.title    ?? "");
    setStage(task?.stage    ?? "todo");
    setPriority(task?.priority ?? "medium");
    setDate(task?.date ? new Date(task.date).toISOString().split("T")[0] : "");
    setSelectedTeam(
      (task?.team ?? []).map((m) => (typeof m === "object" ? m._id : m))
    );
    setAssets(task?.assets ?? []);
    setNewFiles([]);
    setDropdownOpen(false);
    setEditOpen(true);
  };

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files ?? []);
    setNewFiles((prev) => [...prev, ...picked]);
    e.target.value = "";
  };

  const removeExistingAsset = (url) =>
    setAssets((prev) => prev.filter((a) => a !== url));

  const removeNewFile = (idx) =>
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const ok = await updateTask(task._id, {
      title:   title.trim(),
      stage,
      priority,
      date,
      team:    selectedTeam,
      // Mixed array: existing URL strings + new File objects.
      // TaskContext.splitAssets() separates them before building FormData.
      assets:  [...assets, ...newFiles],
    });
    setSaving(false);
    if (ok) setEditOpen(false);
  };

  const handleDelete = async () => {
    await deleteTask(task._id);
    setDeleteOpen(false);
  };

  return (
    <>
      {/* ── Three-dot trigger ─────────────────────────────────────────────── */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          title="Task options"
        >
          <BsThreeDots size={18} />
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-7 z-50 w-44 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
            <button
              type="button"
              onClick={handleOpenEdit}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <MdOutlineEdit size={16} className="text-blue-500" />
              Edit
            </button>

            <button
              type="button"
              onClick={() => { setDropdownOpen(false); setSubTaskOpen(true); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <MdAdd size={16} className="text-green-500" />
              Add Sub-Task
            </button>

            <div className="border-t border-gray-100" />

            <button
              type="button"
              onClick={() => { setDropdownOpen(false); setDeleteOpen(true); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <MdOutlineDeleteOutline size={16} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* ── Edit dialog ───────────────────────────────────────────────────── */}
      <Transition appear show={editOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setEditOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0"      enterTo="opacity-100"
            leave="ease-in  duration-150" leaveFrom="opacity-100"    leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200" enterFrom="opacity-0 scale-95"    enterTo="opacity-100 scale-100"
                leave="ease-in  duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <Dialog.Title className="text-base font-semibold text-gray-800">
                      Edit Task
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={() => setEditOpen(false)}
                      className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                    >
                      <MdClose size={18} />
                    </button>
                  </div>

                  <div className="space-y-4">

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        placeholder="Task title"
                      />
                    </div>

                    {/* Stage + Priority */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Stage
                        </label>
                        <select
                          value={stage}
                          onChange={(e) => setStage(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white transition-all"
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Priority
                        </label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white transition-all"
                        >
                          {PRIORITIES.map((p) => (
                            <option key={p} value={p}>
                              {p.charAt(0).toUpperCase() + p.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Due Date */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>

                    {/* Team */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Assign Task To
                      </label>
                      <UserSelectDropdown
                        allUsers={allUsers}
                        selected={selectedTeam}
                        onChange={setSelectedTeam}
                      />
                    </div>

                    {/* Attachments */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Attachments
                      </label>

                      {/* Existing files on server */}
                      {assets.length > 0 && (
                        <ul className="mb-2 space-y-1">
                          {assets.map((url) => {
                            const name = url.split("/").pop();
                            return (
                              <li
                                key={url}
                                className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200"
                              >
                                <MdAttachFile className="text-gray-400 shrink-0" />
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 truncate text-blue-600 hover:underline"
                                >
                                  {name}
                                </a>
                                <button
                                  type="button"
                                  onClick={() => removeExistingAsset(url)}
                                  className="text-gray-400 hover:text-red-500 shrink-0 transition-colors"
                                  title="Remove"
                                >
                                  <MdOutlineDeleteOutline size={14} />
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      {/* New files staged for upload */}
                      {newFiles.length > 0 && (
                        <ul className="mb-2 space-y-1">
                          {newFiles.map((f, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 rounded-lg px-2 py-1.5 border border-blue-100"
                            >
                              <MdAttachFile className="text-blue-400 shrink-0" />
                              <span className="flex-1 truncate">{f.name}</span>
                              <span className="text-gray-400 shrink-0">
                                {(f.size / 1024).toFixed(0)} KB
                              </span>
                              <button
                                type="button"
                                onClick={() => removeNewFile(i)}
                                className="text-gray-400 hover:text-red-500 shrink-0 transition-colors"
                              >
                                <MdOutlineDeleteOutline size={14} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/*
                        FIX: `accept` prevents .jsx / .ts / .tsx / etc. from
                        appearing in the file picker — matches backend fileFilter.
                        Previously this input had no accept attribute, so users
                        could accidentally pick source files, causing multer to
                        throw "File type .jsx is not allowed" → 500 error.
                      */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={ACCEPTED_FILES}
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors mt-1"
                      >
                        <MdAttachFile size={14} />
                        Add files
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setEditOpen(false)}
                      className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || !title.trim()}
                      className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                  </div>

                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* ── Add Sub-Task modal ────────────────────────────────────────────── */}
      <AddSubTask
        open={subTaskOpen}
        setOpen={setSubTaskOpen}
        id={task._id}
      />

      {/* ── Delete confirmation ───────────────────────────────────────────── */}
      <ConfirmatioDialog
        open={deleteOpen}
        setOpen={setDeleteOpen}
        onClick={handleDelete}
      />
    </>
  );
};

export default TaskDialog;
