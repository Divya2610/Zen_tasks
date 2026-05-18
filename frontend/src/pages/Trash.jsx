import React, { useState, useEffect } from "react";
import { MdDelete, MdKeyboardArrowDown, MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp, MdOutlineRestore } from "react-icons/md";
import Title from "../components/Title";
import Button from "../components/Button";
import { PRIORITY_STYLES, TASK_TYPE } from "../utils";
import ConfirmationDialog from "../components/Dialogs";
import { toast } from "sonner";
import { clsx } from "clsx";
import api from "../utils/api";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const Trash = () => {
  const [trashedTasks, setTrashedTasks] = useState([]); // ✅ real API state
  const [openDialog, setOpenDialog] = useState(false);
  const [msg, setMsg] = useState(null);
  const [type, setType] = useState("delete");
  const [selected, setSelected] = useState("");

  useEffect(() => {
    fetchTrashedTasks();
  }, []);

  const fetchTrashedTasks = async () => {
    try {
      // ✅ Requires GET /api/tasks?trashed=true on backend
      const { data } = await api.get("/tasks?trashed=true");
      setTrashedTasks(data);
    } catch (error) {
      toast.error("Failed to load trashed tasks");
    }
  };

  // ✅ FIXED: was called but never defined — crashed every dialog confirm click
  const deleteRestoreHandler = async () => {
    try {
      if (type === "delete") {
        await api.delete(`/tasks/${selected}`);
        setTrashedTasks((prev) => prev.filter((t) => t._id !== selected));
        toast.success("Task permanently deleted");
      } else if (type === "restore") {
        await api.patch(`/tasks/${selected}/restore`);
        setTrashedTasks((prev) => prev.filter((t) => t._id !== selected));
        toast.success("Task restored");
      } else if (type === "deleteAll") {
        await api.delete("/tasks/trash/all");
        setTrashedTasks([]);
        toast.success("All trashed tasks deleted");
      } else if (type === "restoreAll") {
        await api.patch("/tasks/trash/restore-all");
        setTrashedTasks([]);
        toast.success("All tasks restored");
      }
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setOpenDialog(false);
      setSelected("");
    }
  };

  const deleteAllClick = () => {
    setType("deleteAll");
    setMsg("Do you want to permanently delete all trashed items?");
    setOpenDialog(true);
  };

  const restoreAllClick = () => {
    setType("restoreAll");
    setMsg("Do you want to restore all items from trash?");
    setOpenDialog(true);
  };

  const deleteClick = (id) => {
    setType("delete");
    setSelected(id);
    setOpenDialog(true);
  };

  const restoreClick = (id) => {
    setSelected(id);
    setType("restore");
    setMsg("Do you want to restore this task?");
    setOpenDialog(true);
  };

  return (
    <>
      <div className="w-full md:px-1 px-0 mb-6">
        <div className="flex items-center justify-between mb-8">
          <Title title="Trashed Tasks" />
          <div className="flex gap-2 md:gap-4 items-center">
            <Button
              label="Restore All"
              icon={<MdOutlineRestore className="text-lg hidden md:flex" />}
              className="flex flex-row-reverse gap-1 items-center text-black text-sm md:text-base rounded-md"
              onClick={restoreAllClick}
            />
            <Button
              label="Delete All"
              icon={<MdDelete className="text-lg hidden md:flex" />}
              className="flex flex-row-reverse gap-1 items-center text-red-600 text-sm md:text-base rounded-md"
              onClick={deleteAllClick}
            />
          </div>
        </div>

        <div className="bg-white px-2 md:px-6 py-4 shadow-md rounded">
          <div className="overflow-x-auto">
            <table className="w-full mb-5">
              <thead className="border-b border-gray-300">
                <tr className="text-black text-left">
                  <th className="py-2">Task Title</th>
                  <th className="py-2">Priority</th>
                  <th className="py-2">Stage</th>
                  <th className="py-2">Modified On</th>
                </tr>
              </thead>
              <tbody>
                {trashedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      No trashed tasks
                    </td>
                  </tr>
                ) : (
                  trashedTasks.map((tk) => (
                    // ✅ key={tk._id}
                    <tr key={tk._id} className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[tk.stage])} />
                          <p className="w-full line-clamp-2 text-base text-black">{tk?.title}</p>
                        </div>
                      </td>
                      <td className="py-2 capitalize">
                        <div className="flex gap-1 items-center">
                          <span className={clsx("text-lg", PRIOTITY_STYELS[tk?.priority])}>
                            {ICONS[tk?.priority]}
                          </span>
                          <span>{tk?.priority}</span>
                        </div>
                      </td>
                      <td className="py-2 capitalize">{tk?.stage}</td>
                      <td className="py-2 text-sm">{new Date(tk?.date).toDateString()}</td>
                      <td className="py-2 flex gap-1 justify-end">
                        <Button
                          icon={<MdOutlineRestore className="text-xl text-gray-500" />}
                          onClick={() => restoreClick(tk._id)}
                        />
                        <Button
                          icon={<MdDelete className="text-xl text-red-600" />}
                          onClick={() => deleteClick(tk._id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={openDialog}
        setOpen={setOpenDialog}
        msg={msg}
        setMsg={setMsg}
        type={type}
        setType={setType}
        onClick={deleteRestoreHandler} // ✅ now actually defined
      />
    </>
  );
};

export default Trash;

// import clsx from "clsx";
// import React, { useState } from "react";
// import {
//   MdDelete,
//   MdKeyboardArrowDown,
//   MdKeyboardArrowUp,
//   MdKeyboardDoubleArrowUp,
//   MdOutlineRestore,
// } from "react-icons/md";
// import { tasks } from "../assets/data";
// import Title from "../components/Title";
// import Button from "../components/Button";
// import { PRIORITY_STYLES, TASK_TYPE } from "../utils";
// import AddUser from "../components/AddUser";
// import ConfirmatioDialog from "../components/Dialogs";

// const ICONS = {
//   high: <MdKeyboardDoubleArrowUp />,
//   medium: <MdKeyboardArrowUp />,
//   low: <MdKeyboardArrowDown />,
// };

// const Trash = () => {
//   const [openDialog, setOpenDialog] = useState(false);
//   const [open, setOpen] = useState(false);
//   const [msg, setMsg] = useState(null);
//   const [type, setType] = useState("delete");
//   const [selected, setSelected] = useState("");

//   const deleteAllClick = () => {
//     setType("deleteAll");
//     setMsg("Do you want to permenantly delete all items?");
//     setOpenDialog(true);
//   };

//   const restoreAllClick = () => {
//     setType("restoreAll");
//     setMsg("Do you want to restore all items in the trash?");
//     setOpenDialog(true);
//   };

//   const deleteClick = (id) => {
//     setType("delete");
//     setSelected(id);
//     setOpenDialog(true);
//   };

//   const restoreClick = (id) => {
//     setSelected(id);
//     setType("restore");
//     setMsg("Do you want to restore the selected item?");
//     setOpenDialog(true);
//   };
// const deleteRestoreHandler = async () => {
//   if (type === "delete") {
//     await axios.delete(`http://localhost:5001/tasks/${selected}`);
//     setTrashedTasks(prev => prev.filter(t => t._id !== selected));
//   } else if (type === "deleteAll") {
//     await axios.delete("http://localhost:5001/tasks/trash/all");
//     setTrashedTasks([]);
//   } else if (type === "restore") {
//     await axios.patch(`http://localhost:5001/tasks/${selected}/restore`);
//     setTrashedTasks(prev => prev.filter(t => t._id !== selected));
//   } else if (type === "restoreAll") {
//     await axios.patch("http://localhost:5001/tasks/restore/all");
//     setTrashedTasks([]);
//   }
//   setOpenDialog(false);
// };
//   const TableHeader = () => (
//     <thead className='border-b border-gray-300'>
//       <tr className='text-black  text-left'>
//         <th className='py-2'>Task Title</th>
//         <th className='py-2'>Priority</th>
//         <th className='py-2'>Stage</th>
//         <th className='py-2 line-clamp-1'>Modified On</th>
//       </tr>
//     </thead>
//   );

//   const TableRow = ({ item }) => (
//     <tr className='border-b border-gray-200 text-gray-600 hover:bg-gray-400/10'>
//       <td className='py-2'>
//         <div className='flex items-center gap-2'>
//           <div
//             className={clsx("w-4 h-4 rounded-full", TASK_TYPE[item.stage])}
//           />
//           <p className='w-full line-clamp-2 text-base text-black'>
//             {item?.title}
//           </p>
//         </div>
//       </td>

//       <td className='py-2 capitalize'>
//         <div className={"flex gap-1 items-center"}>
//           <span className={clsx("text-lg", PRIORITY_STYLES[item?.priority])}>
//             {ICONS[item?.priority]}
//           </span>
//           <span className=''>{item?.priority}</span>
//         </div>
//       </td>

//       <td className='py-2 capitalize text-center md:text-start'>
//         {item?.stage}
//       </td>
//       <td className='py-2 text-sm'>{new Date(item?.date).toDateString()}</td>

//       <td className='py-2 flex gap-1 justify-end'>
//         <Button
//           icon={<MdOutlineRestore className='text-xl text-gray-500' />}
//           onClick={() => restoreClick(item._id)}
//         />
//         <Button
//           icon={<MdDelete className='text-xl text-red-600' />}
//           onClick={() => deleteClick(item._id)}
//         />
//       </td>
//     </tr>
//   );

//   return (
//     <>
//       <div className='w-full md:px-1 px-0 mb-6'>
//         <div className='flex items-center justify-between mb-8'>
//           <Title title='Trashed Tasks' />

//           <div className='flex gap-2 md:gap-4 items-center'>
//             <Button
//               label='Restore All'
//               icon={<MdOutlineRestore className='text-lg hidden md:flex' />}
//               className='flex flex-row-reverse gap-1 items-center  text-black text-sm md:text-base rounded-md 2xl:py-2.5'
//               onClick={() => restoreAllClick()}
//             />
//             <Button
//               label='Delete All'
//               icon={<MdDelete className='text-lg hidden md:flex' />}
//               className='flex flex-row-reverse gap-1 items-center  text-red-600 text-sm md:text-base rounded-md 2xl:py-2.5'
//               onClick={() => deleteAllClick()}
//             />
//           </div>
//         </div>
//         <div className='bg-white px-2 md:px-6 py-4 shadow-md rounded'>
//           <div className='overflow-x-auto'>
//             <table className='w-full mb-5'>
//               <TableHeader />
//               <tbody>
//                 {tasks?.map((tk, id) => (
//                   <TableRow key={id} item={tk} />
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* <AddUser open={open} setOpen={setOpen} /> */}

//       <ConfirmatioDialog
//         open={openDialog}
//         setOpen={setOpenDialog}
//         msg={msg}
//         setMsg={setMsg}
//         type={type}
//         setType={setType}
//         onClick={() => deleteRestoreHandler()}
//       />
//     </>
//   );
// };

// export default Trash;
