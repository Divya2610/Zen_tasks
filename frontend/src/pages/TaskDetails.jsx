// // src/pages/TaskDetails.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import clsx from "clsx";
// import { toast } from "sonner";
// import Loader from "../components/Loader.jsx";
// import api, { updateTaskStatus, uploadTaskDocument, postTaskActivity } from "../utils/api.js";

// const STAGE_OPTIONS = ["todo", "in progress", "completed"];
// const PRIORITY_BADGE = {
//   high: "bg-red-100 text-red-700",
//   medium: "bg-yellow-100 text-yellow-700",
//   normal: "bg-blue-100 text-blue-700",
//   low: "bg-gray-100 text-gray-600",
// };

// export default function TaskDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);
//   const isAdmin = user?.isAdmin;
//   const fileRef = useRef(null);

//   const [task, setTask] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [stage, setStage] = useState("");
//   const [updating, setUpdating] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [comment, setComment] = useState("");
//   const [postingComment, setPostingComment] = useState(false);

//   // ── Fetch Task ─────────────────────────────────────────────────────────────
//   const fetchTask = async () => {
//     try {
//       const { data } = await api.get(`/task/${id}`);
//       setTask(data.task);
//       setStage(data.task.stage);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Task not found");
//       navigate(-1);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTask();
//   }, [id]);

//   // ── Status Update ──────────────────────────────────────────────────────────
//   const handleStatusChange = async (newStage) => {
//     if (newStage === stage) return;
//     setUpdating(true);
//     try {
//       await updateTaskStatus(id, newStage);
//       setStage(newStage);
//       toast.success(`Status updated to "${newStage}"`);
//       fetchTask();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to update status");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   // ── Document Upload ────────────────────────────────────────────────────────
//   const handleFileChange = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const formData = new FormData();
//     formData.append("document", file);
//     setUploading(true);
//     try {
//       await uploadTaskDocument(id, formData);
//       toast.success("Document uploaded!");
//       fetchTask();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Upload failed");
//     } finally {
//       setUploading(false);
//       if (fileRef.current) fileRef.current.value = "";
//     }
//   };

//   // ── Comment ────────────────────────────────────────────────────────────────
//   const handlePostComment = async () => {
//     if (!comment.trim()) return;
//     setPostingComment(true);
//     try {
//       await postTaskActivity(id, { type: "commented", activity: comment });
//       setComment("");
//       toast.success("Comment added!");
//       fetchTask();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to post comment");
//     } finally {
//       setPostingComment(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <Loader />
//       </div>
//     );
//   }

//   if (!task) return null;

//   return (
//     <div className="max-w-3xl mx-auto py-6 px-4">
//       {/* ── Back ── */}
//       <button
//         onClick={() => navigate(-1)}
//         className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1"
//       >
//         ← Back
//       </button>

//       {/* ── Task Header ── */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
//         <div className="flex items-start justify-between gap-4">
//           <div>
//             <h1 className="text-xl font-bold text-gray-800">{task.title}</h1>
//             {task.description && (
//               <p className="text-sm text-gray-500 mt-1">{task.description}</p>
//             )}
//           </div>
//           <span
//             className={clsx(
//               "text-xs font-semibold px-2.5 py-1 rounded-full capitalize shrink-0",
//               PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.normal
//             )}
//           >
//             {task.priority} priority
//           </span>
//         </div>

//         <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
//           <span>
//             📅 Due:{" "}
//             <span className="font-medium text-gray-700">
//               {new Date(task.date).toLocaleDateString()}
//             </span>
//           </span>
//           <span>
//             🏷 Stage:{" "}
//             <span className="font-medium text-gray-700 capitalize">
//               {stage}
//             </span>
//           </span>
//         </div>

//         {/* Team */}
//         {task.team?.length > 0 && (
//           <div className="mt-3">
//             <p className="text-xs text-gray-500 mb-1">Assigned to:</p>
//             <div className="flex flex-wrap gap-2">
//               {task.team.map((m) => (
//                 <span
//                   key={m._id}
//                   className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
//                 >
//                   <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
//                     {m.name?.[0]?.toUpperCase()}
//                   </span>
//                   {m.name}
//                 </span>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Status Update (both admin and team member can change) ── */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
//         <h2 className="text-sm font-semibold text-gray-700 mb-3">
//           Update Status
//         </h2>
//         <div className="flex gap-2 flex-wrap">
//           {STAGE_OPTIONS.map((s) => (
//             <button
//               key={s}
//               onClick={() => handleStatusChange(s)}
//               disabled={updating}
//               className={clsx(
//                 "text-sm px-4 py-2 rounded-lg font-medium border capitalize transition-all",
//                 stage === s
//                   ? "bg-blue-600 text-white border-blue-600 shadow-sm"
//                   : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
//               )}
//             >
//               {s}
//             </button>
//           ))}
//         </div>
//         {updating && (
//           <p className="text-xs text-blue-500 mt-2">Saving status…</p>
//         )}
//       </div>

//       {/* ── Sub-tasks ── */}
//       {task.subTasks?.length > 0 && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
//           <h2 className="text-sm font-semibold text-gray-700 mb-3">
//             Sub-tasks
//           </h2>
//           <ul className="space-y-2">
//             {task.subTasks.map((sub, i) => (
//               <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
//                 <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
//                 <span className="flex-1">{sub.title}</span>
//                 {sub.tag && (
//                   <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
//                     {sub.tag}
//                   </span>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* ── Documents ── */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
//         <h2 className="text-sm font-semibold text-gray-700 mb-3">
//           Documents
//         </h2>

//         {/* Existing documents */}
//         {task.assets?.length > 0 ? (
//           <ul className="space-y-1 mb-3">
//             {task.assets.map((url, i) => (
//               <li key={i}>
//                 <a
//                   href={`${import.meta.env.VITE_APP_BASE_URL || "http://localhost:5000"}${url}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-sm text-blue-600 hover:underline flex items-center gap-1.5"
//                 >
//                   📎 Document {i + 1}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p className="text-sm text-gray-400 mb-3">No documents uploaded yet.</p>
//         )}

//         {/* Upload */}
//         <div className="flex items-center gap-3">
//           <input
//             ref={fileRef}
//             type="file"
//             className="hidden"
//             accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
//             onChange={handleFileChange}
//             disabled={uploading}
//           />
//           <button
//             onClick={() => fileRef.current?.click()}
//             disabled={uploading}
//             className={clsx(
//               "text-sm px-4 py-2 rounded-lg border font-medium transition-all",
//               uploading
//                 ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
//                 : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
//             )}
//           >
//             {uploading ? "Uploading…" : "📁 Upload Document"}
//           </button>
//           <span className="text-xs text-gray-400">PDF, DOC, Images (max 10MB)</span>
//         </div>
//       </div>

//       {/* ── Activity / Comments ── */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//         <h2 className="text-sm font-semibold text-gray-700 mb-3">
//           Activity & Comments
//         </h2>

//         {/* Post comment */}
//         <div className="flex gap-2 mb-4">
//           <input
//             type="text"
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
//             placeholder="Add a comment…"
//             className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
//           />
//           <button
//             onClick={handlePostComment}
//             disabled={postingComment || !comment.trim()}
//             className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
//           >
//             {postingComment ? "Posting…" : "Post"}
//           </button>
//         </div>

//         {/* Activity list */}
//         {task.activities?.length > 0 ? (
//           <ul className="space-y-3">
//             {[...task.activities].reverse().map((act, i) => (
//               <li key={i} className="flex gap-3 text-sm">
//                 <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
//                   {act.by?.name?.[0]?.toUpperCase() || "?"}
//                 </div>
//                 <div>
//                   <p className="text-gray-700">
//                     <span className="font-medium capitalize">{act.type}</span>
//                     {": "}
//                     {act.activity}
//                   </p>
//                   {act.by?.name && (
//                     <p className="text-xs text-gray-400">by {act.by.name}</p>
//                   )}
//                   {act.docUrl && (
//                     <a
//                       href={`${import.meta.env.VITE_APP_BASE_URL || "http://localhost:5000"}${act.docUrl}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
//                     >
//                       📎 View document
//                     </a>
//                   )}
//                 </div>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p className="text-sm text-gray-400">No activity yet.</p>
//         )}
//       </div>
//     </div>
//   );
// }


import clsx from "clsx";
import moment from "moment";
import React, { useState, useEffect, useRef } from "react";
import { FaBug, FaTasks, FaThumbsUp, FaUser } from "react-icons/fa";
import { GrInProgress } from "react-icons/gr";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineDoneAll,
  MdOutlineMessage,
  MdTaskAlt,
  MdOutlineAttachFile,
  MdClose,
  MdInsertDriveFile,
  MdOutlineCalendarToday,
  MdCloudUpload,
  MdCheckCircle,
} from "react-icons/md";
import { RxActivityLog } from "react-icons/rx";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import Tabs from "../components/Tabs";
import { PRIORITY_STYLES, TASK_TYPE, getInitials } from "../utils";
import Loading from "../components/Loader";
import Button from "../components/Button";
import api from "../utils/api";
import { useTasks } from "../context/TaskContext";
import { getAssetHref, getAssetName, isImageAsset } from "../utils/assets";
import { isAdminUser } from "../utils/role";

// ─── Constants ────────────────────────────────────────────────────────────────

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  normal: <MdKeyboardArrowDown />,
};

const PRIORITY_BG = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  normal: "bg-blue-100 text-blue-700",
};

const TABS = [
  { title: "Task Detail", icon: <FaTasks /> },
  { title: "Activities/Timeline", icon: <RxActivityLog /> },
];

const TASKTYPEICON = {
  commented: (
    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
      <MdOutlineMessage />
    </div>
  ),
  started: (
    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
      <FaThumbsUp size={20} />
    </div>
  ),
  assigned: (
    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-500 text-white">
      <FaUser size={14} />
    </div>
  ),
  bug: (
    <div className="text-red-600">
      <FaBug size={24} />
    </div>
  ),
  completed: (
    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
      <MdOutlineDoneAll size={24} />
    </div>
  ),
  "in progress": (
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-600 text-white">
      <GrInProgress size={16} />
    </div>
  ),
};

const act_types = [
  "Started",
  "Completed",
  "In Progress",
  "Commented",
  "Bug",
  "Assigned",
];

const STAGE_OPTIONS = ["todo", "in progress", "completed"];

// ─── Helper: file type detection ─────────────────────────────────────────────

// ─── Asset viewer (read-only) ─────────────────────────────────────────────────

const AssetGrid = ({ assets }) => {
  if (!assets?.length) {
    return (
      <p className="text-sm text-gray-400 italic">No assets uploaded yet.</p>
    );
  }
  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-3">
      {assets.map((asset, i) =>
        isImageAsset(asset) ? (
          <a key={i} href={getAssetHref(asset)} target="_blank" rel="noreferrer">
            <img
              src={getAssetHref(asset)}
              alt={getAssetName(asset)}
              className="w-full rounded-lg h-28 md:h-36 object-cover cursor-pointer border border-gray-100 transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            />
          </a>
        ) : (
          <a
            key={i}
            href={getAssetHref(asset)}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center gap-2 h-28 md:h-36 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer p-3"
          >
            <MdInsertDriveFile className="text-4xl text-blue-400" />
            <span className="text-xs text-gray-500 truncate w-full text-center">
              {getAssetName(asset)}
            </span>
          </a>
        )
      )}
    </div>
  );
};

// ─── Team Member Panel: update status + upload assets ─────────────────────────

const MemberActionPanel = ({ task, onTaskUpdated }) => {
  const { updateTaskStatus } = useTasks();
  const fileInputRef = useRef(null);

  const [selectedStage, setSelectedStage] = useState(task?.stage || "todo");
  const [newFiles, setNewFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Sync if task changes (e.g. after save)
  useEffect(() => {
    setSelectedStage(task?.stage || "todo");
  }, [task?.stage]);

  const handleFileSelect = (e) => {
    setNewFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    e.target.value = "";
  };

  const removeFile = (idx) =>
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateTaskStatus(task._id, selectedStage, newFiles);
    if (success) {
      setNewFiles([]);
      onTaskUpdated(); // re-fetch task details
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* ── Status update ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Update Status
        </h3>
        <div className="flex flex-wrap gap-2">
          {STAGE_OPTIONS.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => setSelectedStage(stage)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                selectedStage === stage
                  ? "bg-blue-600 text-white border-blue-600 shadow"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
              )}
            >
              <span className="flex items-center gap-1.5">
                {selectedStage === stage && (
                  <MdCheckCircle className="text-sm" />
                )}
                <span className="capitalize">{stage}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Asset upload ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <MdOutlineAttachFile className="text-blue-500" />
            Upload Assets
          </h3>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-medium text-blue-600 border border-blue-300 rounded px-2 py-1 hover:bg-blue-50 transition-colors"
          >
            + Add Files
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

        {newFiles.length > 0 ? (
          <div className="space-y-2">
            {newFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-gray-50 rounded-lg p-2 border border-gray-200"
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
                  onClick={() => removeFile(idx)}
                  className="text-red-400 hover:text-red-600"
                >
                  <MdClose />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-6 cursor-pointer border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <MdCloudUpload className="text-3xl text-gray-300 mx-auto mb-1" />
            <p className="text-xs text-gray-400">
              Click to select files (images, PDFs, docs…)
            </p>
          </div>
        )}
      </div>

      {/* ── Save button ── */}
      <Button
        type="button"
        label={isSaving ? "Saving..." : "Save Changes"}
        onClick={handleSave}
        className="w-full bg-blue-600 text-white font-semibold rounded-lg py-2.5 hover:bg-blue-700 transition-colors"
      />
    </div>
  );
};

// ─── Main TaskDetails ─────────────────────────────────────────────────────────

const TaskDetails = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = isAdminUser(user);

  const [selected, setSelected] = useState(0);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/tasks/${id}`);
      setTask(data);
    } catch (err) {
      console.error("Error fetching task:", err);
      setError("Could not load task details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTask();
  }, [id]);

  if (loading)
    return (
      <div className="w-full flex justify-center py-10">
        <Loading />
      </div>
    );

  if (error)
    return (
      <div className="w-full flex justify-center py-10">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  if (!task)
    return (
      <div className="w-full flex justify-center py-10">
        <p className="text-gray-500 text-lg">Task not found.</p>
      </div>
    );

  return (
    <div className="w-full flex flex-col gap-3 mb-4 overflow-y-hidden">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl text-gray-700 font-bold">{task?.title}</h1>
        <div
          className={clsx(
            "w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
            isAdmin
              ? "bg-blue-50 text-blue-700 border border-blue-100"
              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
          )}
        >
          {isAdmin ? "Admin view" : "Team member view"}
        </div>
      </div>

      <div
        className={clsx(
          "rounded-lg border px-4 py-3 text-sm",
          isAdmin
            ? "bg-blue-50 border-blue-100 text-blue-800"
            : "bg-emerald-50 border-emerald-100 text-emerald-800"
        )}
      >
        {isAdmin
          ? "You can manage this task, add sub-tasks, and review every uploaded attachment."
          : "You can move this task between To Do, In Progress, and Completed, and upload your files."}
      </div>

      <Tabs tabs={TABS} setSelected={setSelected}>
        {selected === 0 ? (
          <div className="w-full flex flex-col md:flex-row gap-6 bg-white shadow-md p-6 md:p-8 overflow-y-auto rounded-lg">
            {/* ── LEFT: Task info ── */}
            <div className="w-full md:w-1/2 space-y-6">
              {/* Priority + Stage badges */}
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={clsx(
                    "flex gap-1 items-center text-sm font-semibold px-3 py-1 rounded-full",
                    PRIORITY_BG[task?.priority]
                  )}
                >
                  <span>{ICONS[task?.priority]}</span>
                  <span className="uppercase">{task?.priority} Priority</span>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                  <div
                    className={clsx(
                      "w-3 h-3 rounded-full",
                      TASK_TYPE[task.stage]
                    )}
                  />
                  <span className="text-sm text-gray-700 uppercase font-medium">
                    {task?.stage}
                  </span>
                </div>
              </div>

              {/* Deadline */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MdOutlineCalendarToday />
                <span>
                  Deadline:{" "}
                  <span className="font-medium text-gray-700">
                    {new Date(task?.date).toDateString()}
                  </span>
                </span>
              </div>

              {/* Summary bar */}
              <div className="flex items-center gap-8 p-4 border-y border-gray-100 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-800">
                    {task?.assets?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500">Assets</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-800">
                    {task?.subTasks?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500">Sub-Tasks</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-800">
                    {task?.team?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500">Team</p>
                </div>
              </div>

              {/* Team */}
              <div className="space-y-3">
                <p className="text-gray-600 font-semibold text-xs uppercase tracking-wide">
                  Task Team
                </p>
                <div className="space-y-2">
                  {task?.team?.length > 0 ? (
                    task.team.map((m, index) => (
                      <div
                        key={m._id ?? index}
                        className="flex gap-4 py-2.5 px-3 items-center border border-gray-100 rounded-lg hover:bg-gray-50"
                      >
                        <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-blue-600 shrink-0">
                          <span>{getInitials(m?.username || m?.name)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">
                            {m?.username || m?.name}
                          </p>
                          <span className="text-xs text-gray-500">
                            {m?.title || m?.role || "Team Member"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No team members assigned.
                    </p>
                  )}
                </div>
              </div>

              {/* Sub-tasks */}
              <div className="space-y-3">
                <p className="text-gray-500 font-semibold text-xs uppercase tracking-wide">
                  Sub-Tasks
                </p>
                <div className="space-y-4">
                  {task?.subTasks?.length > 0 ? (
                    task.subTasks.map((el, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-violet-50 shrink-0">
                          <MdTaskAlt className="text-violet-600" size={22} />
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm text-gray-500">
                              {new Date(el?.date).toDateString()}
                            </span>
                            {el?.tag && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-violet-100 text-violet-700 font-medium">
                                {el?.tag}
                              </span>
                            )}
                            {el?.completed && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                                ✓ Done
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 font-medium text-sm">
                            {el?.title}
                          </p>
                          {/* Sub-task assignees */}
                          {el?.assignedTo?.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-gray-400">
                                Assigned to:
                              </span>
                              {el.assignedTo.map((u, i) => (
                                <span
                                  key={u._id ?? i}
                                  className="text-xs font-medium text-blue-600"
                                >
                                  {u.username || u.name}
                                  {i < el.assignedTo.length - 1 ? "," : ""}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No sub-tasks yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Assets (admin) or Member Action Panel ── */}
            <div className="w-full md:w-1/2 space-y-6">
              {isAdmin ? (
                /* Admin: view all assets */
                <>
                  <div>
                    <p className="text-gray-600 font-semibold text-xs uppercase tracking-wide mb-3">
                      Assets / Attachments
                    </p>
                    <AssetGrid assets={task?.assets} />
                  </div>
                </>
              ) : (
                /* Team member: update status + upload assets */
                <MemberActionPanel
                  task={task}
                  onTaskUpdated={fetchTask}
                />
              )}

              {/* Admin also sees the assets section — always show uploaded assets */}
              {isAdmin && task?.assets?.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  No assets uploaded yet.
                </p>
              )}
            </div>
          </div>
        ) : (
          <Activities activity={task?.activities} id={id} />
        )}
      </Tabs>
    </div>
  );
};

// ─── Activities tab ────────────────────────────────────────────────────────────

const Activities = ({ activity, id }) => {
  const [selected, setSelected] = useState(act_types[0]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      await api.post(`/tasks/${id}/activity`, {
        type: selected.toLowerCase(),
        activity: text,
      });
      toast.success("Activity added successfully");
      setText("");
    } catch (err) {
      console.error("Error adding activity:", err);
      toast.error("Failed to add activity");
    } finally {
      setIsLoading(false);
    }
  };

  const Card = ({ item }) => (
    <div className="flex space-x-4">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-10 h-10 flex items-center justify-center">
          {TASKTYPEICON[item?.type] ?? (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs">
              ?
            </div>
          )}
        </div>
        <div className="w-full flex items-center">
          <div className="w-0.5 bg-gray-200 h-full" />
        </div>
      </div>

      <div className="flex flex-col gap-y-1 mb-8">
        <p className="font-semibold text-gray-800">
          {item?.by?.username || item?.by?.name || "Unknown"}
        </p>
        <div className="text-gray-500 text-sm space-x-2">
          <span className="capitalize">{item?.type}</span>
          <span>·</span>
          <span>{moment(item?.date).fromNow()}</span>
        </div>
        {item?.activity && (
          <div className="text-gray-700 text-sm">{item?.activity}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 2xl:gap-20 min-h-[60vh] px-6 md:px-10 py-8 bg-white shadow rounded-lg justify-between overflow-y-auto">
      {/* Timeline */}
      <div className="w-full md:w-1/2">
        <h4 className="text-gray-600 font-semibold text-base mb-5">
          Activities
        </h4>
        {activity?.length > 0 ? (
          <div className="w-full">
            {activity.map((el, index) => (
              <Card key={index} item={el} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No activities yet.</p>
        )}
      </div>

      {/* Add activity */}
      <div className="w-full md:w-1/3">
        <h4 className="text-gray-600 font-semibold text-base mb-5">
          Add Activity
        </h4>
        <div className="w-full flex flex-wrap gap-4">
          {act_types.map((item) => (
            <div key={item} className="flex gap-2 items-center">
              <input
                type="checkbox"
                className="w-4 h-4 accent-blue-600"
                checked={selected === item}
                onChange={() => setSelected(item)}
              />
              <p className="text-sm text-gray-700">{item}</p>
            </div>
          ))}
          <textarea
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a note or comment..."
            className="bg-white w-full mt-4 border border-gray-300 outline-none p-4 rounded-lg text-sm focus:ring-2 ring-blue-400 resize-none"
          />
          {isLoading ? (
            <Loading />
          ) : (
            <Button
              type="button"
              label="Submit"
              onClick={handleSubmit}
              className="bg-blue-600 text-white rounded-lg px-6 py-2 text-sm font-semibold hover:bg-blue-700"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
