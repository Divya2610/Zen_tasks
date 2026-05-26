import clsx from "clsx";
import React, { useRef, useState } from "react";
import {
  MdAttachFile,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineCalendarToday,
  MdTaskAlt,
  MdDownload,
  MdUploadFile,
  MdClose,
} from "react-icons/md";
import { BiMessageAltDetail } from "react-icons/bi";
import { FaList } from "react-icons/fa";
import { BGS, PRIORITY_STYLES, TASK_TYPE, formatDate } from "../utils";
import TaskDialog from "./task/TaskDialog";
import UserInfo from "./UserInfo";
import { getAssetHref, getAssetName, getAssetRole, isImageAsset } from "../utils/assets";
import { useTasks } from "../context/TaskContext";

const ICONS = {
  high:   <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low:    <MdKeyboardArrowDown />,
};

const wasEdited = (task) => {
  if (!task?.updatedAt || !task?.createdAt) return false;
  return new Date(task.updatedAt) - new Date(task.createdAt) > 10_000;
};

// ── Helper: resolve asset URL from either the old string format or new object format
const assetUrl  = (a) => (typeof a === "string" ? a : a?.url ?? "");
const assetName = (a) => (typeof a === "string" ? a.split("/").pop() : a?.name || a?.url?.split("/").pop() || "file");
const assetRole = (a) => (typeof a === "string" ? "admin" : a?.uploadedByRole ?? "admin");
const isImage   = (a) => /\.(jpg|jpeg|png|gif|webp)$/i.test(assetUrl(a));

// ── Download helper: forces browser download instead of navigating ────────────
const downloadAsset = (asset) => {
  const url  = getAssetHref(asset);
  const name = getAssetName(asset);
  const link = document.createElement("a");
  link.href     = url;
  link.download = name;
  link.target   = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ── MemberUploadPanel ─────────────────────────────────────────────────────────
// Shown below the asset strip for non-admin users.
// On submit it calls PATCH /tasks/:id/status with the files + optionally a stage.
// Adjust `API_BASE` and the auth header to match your app's setup.
const MemberUploadPanel = ({ task, isAdmin }) => {
  const [files,     setFiles]     = useState([]);
  const [uploading, setUploading] = useState(false);
  const [done,      setDone]      = useState(false);
  const inputRef = useRef();
  const { updateTaskStatus } = useTasks();

  if (isAdmin) return null; // admins upload via the edit modal, not here

  const handleFiles = (e) => setFiles(Array.from(e.target.files));
  const removeFile  = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!files.length) return;
    setUploading(true);
    try {
      const ok = await updateTaskStatus(task._id, task.stage, files);
      if (!ok) throw new Error("Upload failed");
      setDone(true);
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        Add your attachment
      </p>

      {done && (
        <p className="text-xs text-green-600 font-medium mb-2">
          ✓ Uploaded successfully
        </p>
      )}

      {/* File picker */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded px-2 py-1 bg-blue-50"
          type="button"
        >
          <MdUploadFile className="text-sm" />
          Choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
        {files.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded px-3 py-1 font-medium"
            type="button"
          >
            {uploading ? "Uploading…" : `Upload ${files.length} file${files.length > 1 ? "s" : ""}`}
          </button>
        )}
      </div>

      {/* Staged file list */}
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-1 text-xs text-gray-600">
              <MdAttachFile className="text-gray-400 shrink-0" />
              <span className="truncate max-w-[180px]">{f.name}</span>
              <button
                onClick={() => removeFile(i)}
                className="ml-auto text-gray-400 hover:text-red-500"
                type="button"
              >
                <MdClose />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ── TaskCard ──────────────────────────────────────────────────────────────────
const TaskCard = ({ task, isAdmin = false, onChanged }) => {
  const assets   = task?.assets ?? [];
  const subTasks = task?.subTasks ?? [];
  const doneCount = subTasks.filter((s) => s.completed).length;

  return (
    <div className="w-full h-fit bg-white shadow-md p-4 rounded-lg border border-gray-100 relative">

      {/* ── Header ── */}
      <div className="w-full flex justify-between items-center">
        <div className={clsx("flex gap-1 items-center text-sm font-medium", PRIORITY_STYLES[task?.priority])}>
          <span className="text-lg">{ICONS[task?.priority]}</span>
          <span className="uppercase">{task?.priority} Priority</span>
        </div>
        <div className="flex items-center gap-2">
          {wasEdited(task) && (
            <span className="text-[10px] font-medium text-gray-400 italic">edited</span>
          )}
          {isAdmin && <TaskDialog task={task} onChanged={onChanged} />}
        </div>
      </div>

      {/* ── Title ── */}
      <div className="flex items-center gap-2 mt-3">
        <div className={clsx("w-4 h-4 rounded-full shrink-0", TASK_TYPE[task.stage])} />
        <h4 className="line-clamp-2 text-black font-medium">{task?.title}</h4>
      </div>

      {/* ── Deadline ── */}
      <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
        <MdOutlineCalendarToday className="text-gray-400" />
        <span>{formatDate(new Date(task?.date))}</span>
      </div>

      <div className="w-full border-t border-gray-100 my-3" />

      {/* ── Stats row ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1 items-center text-sm text-gray-500" title="Comments">
            <BiMessageAltDetail />
            <span>{task?.activities?.length ?? 0}</span>
          </div>
          <div
            className={clsx(
              "flex gap-1 items-center text-sm",
              assets.length > 0 ? "text-blue-600 font-semibold" : "text-gray-500"
            )}
            title="Assets / Attachments"
          >
            <MdAttachFile />
            <span>{assets.length}</span>
          </div>
          <div className="flex gap-1 items-center text-sm text-gray-500" title="Sub-tasks">
            <FaList />
            <span>{doneCount}/{subTasks.length}</span>
          </div>
        </div>

        {/* Team avatars */}
        <div className="flex flex-row-reverse">
          {task?.team?.map((m, index) => (
            <div
              key={m._id ?? index}
              className={clsx(
                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1 border-2 border-white",
                BGS[index % BGS.length]
              )}
            >
              <UserInfo user={m} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Asset list with download buttons ── */}
      {assets.length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Attachments
          </p>
          <div className="space-y-1.5">
            {assets.map((asset, i) => {
              const url  = getAssetHref(asset);
              const name = getAssetName(asset);
              const role = getAssetRole(asset);

              return (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1.5 border border-gray-100"
                >
                  {/* Thumbnail or icon */}
                  {isImageAsset(asset) ? (
                    <img
                      src={url}
                      alt={name}
                      className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                      <MdAttachFile className="text-gray-400" />
                    </div>
                  )}

                  {/* Name + role badge */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{name}</p>
                    <span
                      className={clsx(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                        role === "admin"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-blue-50 text-blue-600"
                      )}
                    >
                      {role === "admin" ? "From admin" : "From member"}
                    </span>
                  </div>

                  {/* Download button — visible to everyone */}
                  <button
                    onClick={() => downloadAsset(asset)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium shrink-0 border border-blue-200 rounded px-2 py-1 bg-blue-50 hover:bg-blue-100 transition-colors"
                    title={`Download ${name}`}
                    type="button"
                  >
                    <MdDownload className="text-sm" />
                    Download
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Member upload panel ── */}
      <MemberUploadPanel task={task} isAdmin={isAdmin} />

      {/* ── Sub-tasks ── */}
      {subTasks.length > 0 ? (
        <div className="pt-3 border-t border-gray-100 mt-3 space-y-2.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Sub-tasks ({doneCount}/{subTasks.length} done)
          </p>
          {subTasks.map((sub, i) => (
            <div key={sub._id ?? i} className="flex items-start gap-2">
              <div
                className={clsx(
                  "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                  sub.completed ? "bg-green-500 border-green-500" : "border-gray-300"
                )}
              >
                {sub.completed && <MdTaskAlt className="text-white text-[10px]" />}
              </div>
              <div className="flex-1 min-w-0">
                <h5
                  className={clsx(
                    "text-sm font-medium line-clamp-1",
                    sub.completed ? "line-through text-gray-400" : "text-gray-700"
                  )}
                >
                  {sub.title}
                </h5>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-xs text-gray-400">{formatDate(new Date(sub?.date))}</span>
                  {sub.tag && (
                    <span className="bg-blue-50 px-2 py-0.5 rounded-full text-blue-700 text-xs font-medium">
                      {sub.tag}
                    </span>
                  )}
                  {sub.assignedTo?.length > 0 && (
                    <div className="flex flex-row-reverse ml-auto">
                      {sub.assignedTo.map((u, j) => (
                        <div
                          key={u._id ?? j}
                          className={clsx(
                            "w-5 h-5 rounded-full text-white flex items-center justify-center text-[9px] -mr-1 border border-white",
                            BGS[j % BGS.length]
                          )}
                        >
                          <UserInfo user={u} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="pt-3 border-t border-gray-100 mt-3">
          <span className="text-xs text-gray-400">No sub-tasks</span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
