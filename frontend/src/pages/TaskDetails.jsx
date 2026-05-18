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

const isImage = (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

const getFileName = (url) => (url ? url.split("/").pop() : "file");

// ─── Asset viewer (read-only) ─────────────────────────────────────────────────

const AssetGrid = ({ assets }) => {
  if (!assets?.length) {
    return (
      <p className="text-sm text-gray-400 italic">No assets uploaded yet.</p>
    );
  }
  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-3">
      {assets.map((url, i) =>
        isImage(url) ? (
          <a key={i} href={url} target="_blank" rel="noreferrer">
            <img
              src={url}
              alt={getFileName(url)}
              className="w-full rounded-lg h-28 md:h-36 object-cover cursor-pointer border border-gray-100 transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            />
          </a>
        ) : (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center gap-2 h-28 md:h-36 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer p-3"
          >
            <MdInsertDriveFile className="text-4xl text-blue-400" />
            <span className="text-xs text-gray-500 truncate w-full text-center">
              {getFileName(url)}
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
  const isAdmin = user?.isAdmin;

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
      <h1 className="text-2xl text-gray-700 font-bold">{task?.title}</h1>

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
