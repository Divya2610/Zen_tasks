import { useState } from "react";
import { BiMessageAltDetail } from "react-icons/bi";
import {
  MdAttachFile,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { BGS, PRIORITY_STYLES, TASK_TYPE, formatDate } from "../../utils";
import clsx from "clsx";
import { FaList } from "react-icons/fa";
import UserInfo from "../UserInfo";
import Button from "../Button";
import ConfirmatioDialog from "../Dialogs";
import TaskForm from "./TaskForm";          // ✅ for inline Edit button
import { useTasks } from "../../context/TaskContext";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const Table = ({ tasks }) => {
  const { deleteTask } = useTasks();
  const [openDialog, setOpenDialog]     = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // ✅ FIX: filter out undefined/null tasks before mapping.
  //    Undefined items in the array caused task._id to crash inside TableRow.
  const safeTasks = Array.isArray(tasks)
    ? tasks.filter((task) => task && task._id)
    : [];

  const deleteClicks = (id) => {
    setSelectedTaskId(id);
    setOpenDialog(true);
  };

  const deleteHandler = async () => {
    if (!selectedTaskId) return;
    await deleteTask(selectedTaskId);
    setOpenDialog(false);
    setSelectedTaskId(null);
  };

  const TableHeader = () => (
    <thead className="w-full border-b border-gray-300">
      <tr className="w-full text-black text-left">
        <th className="py-2">Task Title</th>
        <th className="py-2">Priority</th>
        <th className="py-2 line-clamp-1">Created At</th>
        <th className="py-2">Assets</th>
        <th className="py-2">Team</th>
        <th className="py-2">Actions</th>
      </tr>
    </thead>
  );

  const TableRow = ({ task }) => {
    // ✅ Belt-and-suspenders guard — safe even if filter above is bypassed
    if (!task?._id) return null;

    const [openEdit, setOpenEdit] = useState(false);

    return (
      <>
        <tr className="border-b border-gray-200 text-gray-600 hover:bg-gray-300/10">
          <td className="py-2">
            <div className="flex items-center gap-2">
              <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])} />
              <p className="w-full line-clamp-2 text-base text-black">{task?.title}</p>
            </div>
          </td>

          <td className="py-2">
            <div className="flex gap-1 items-center">
              <span className={clsx("text-lg", PRIORITY_STYLES[task?.priority])}>
                {ICONS[task?.priority]}
              </span>
              <span className="capitalize line-clamp-1">
                {task?.priority} Priority
              </span>
            </div>
          </td>

          <td className="py-2">
            <span className="text-sm text-gray-600">
              {formatDate(new Date(task?.date))}
            </span>
          </td>

          <td className="py-2">
            <div className="flex items-center gap-3">
              <div className="flex gap-1 items-center text-sm text-gray-600">
                <BiMessageAltDetail />
                <span>{task?.activities?.length ?? 0}</span>
              </div>
              <div className="flex gap-1 items-center text-sm text-gray-600">
                <MdAttachFile />
                <span>{task?.assets?.length ?? 0}</span>
              </div>
              <div className="flex gap-1 items-center text-sm text-gray-600">
                <FaList />
                <span>0/{task?.subTasks?.length ?? 0}</span>
              </div>
            </div>
          </td>

          <td className="py-2">
            <div className="flex">
              {task?.team?.map((m, index) => (
                <div
                  key={m._id}
                  className={clsx(
                    "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                    BGS[index % BGS?.length]
                  )}
                >
                  <UserInfo user={m} />
                </div>
              ))}
            </div>
          </td>

          <td className="py-2 flex gap-2 md:gap-4 justify-end">
            {/* ✅ Edit button now opens TaskForm instead of doing nothing */}
            <Button
              className="text-blue-600 hover:text-blue-500 sm:px-0 text-sm md:text-base"
              label="Edit"
              type="button"
              onClick={() => setOpenEdit(true)}
            />
            <Button
              className="text-red-700 hover:text-red-500 sm:px-0 text-sm md:text-base"
              label="Delete"
              type="button"
              onClick={() => deleteClicks(task._id)}
            />
          </td>
        </tr>

        {/* ✅ TaskForm mounted per-row so edit targets the correct task */}
        <TaskForm
          open={openEdit}
          setOpen={setOpenEdit}
          task={task}
          key={task._id}
        />
      </>
    );
  };

  return (
    <>
      <div className="bg-white px-2 md:px-4 pt-4 pb-9 shadow-md rounded">
        <div className="overflow-x-auto">
          <table className="w-full">
            <TableHeader />
            <tbody>
              {safeTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                safeTasks.map((task) => (
                  <TableRow key={task._id} task={task} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />
    </>
  );
};

export default Table;
