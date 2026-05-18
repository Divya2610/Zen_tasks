import React from "react";
import TaskCard from "./TaskCard";

const BoardView = ({ tasks }) => {
  // ✅ FIX: filter out any undefined/null items before mapping.
  //    If a task is undefined in the array, passing it to TaskCard → TaskDialog
  //    causes: "Cannot read properties of undefined (reading '_id')"
  const safeTasks = Array.isArray(tasks)
    ? tasks.filter((task) => task && task._id)
    : [];

  return (
    <div className="w-full py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 2xl:gap-10">
      {safeTasks.length === 0 ? (
        <p className="text-gray-400 col-span-3 text-center py-10">
          No tasks found.
        </p>
      ) : (
        safeTasks.map((task) => (
          <TaskCard task={task} key={task._id} />
        ))
      )}
    </div>
  );
};

export default BoardView;
