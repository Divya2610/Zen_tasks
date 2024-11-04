import React, { useState, useEffect } from "react";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import SelectList from "../SelectList";
import { BiImages } from "react-icons/bi";
import Button from "../Button";
import axios from "axios";
import { useForm } from "react-hook-form"; // Import useForm from react-hook-form
import UserList from "./UserList"; // Import UserList component

const LISTS = ["todo", "in progress", "completed"]; // Changed to lowercase
const PRIORIRY = ["high", "medium", "normal"]; // Changed to lowercase

const EditTask = ({ open, setOpen, task, onUpdate }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm(); // Initialize useForm hook
  const [stage, setStage] = useState(task.stage || LISTS[0]);
  const [priority, setPriority] = useState(task.priority || PRIORIRY[2]);
  const [team, setTeam] = useState(task.team || []); // State for managing team members
  const [files, setFiles] = useState(task.files || []); // State for managing uploaded files

  useEffect(() => {
    reset(task); // Reset form fields when task prop changes
  }, [task, reset]);

  const submitHandler = async (data) => {
    try {
      const formData = {
        title: data.title,
        stage: stage.toLowerCase(),
        date: new Date(data.date).toISOString().split("T")[0], // Convert to ISO format and extract date part
        priority: priority.toLowerCase(),
      };

      const response = await axios.patch(
        `http://localhost:5001/tasks/${task._id}`,
        formData
      );

      console.log(response.data);
      setOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleSelect = (e) => {
    // handle file select
    const fileList = Array.from(e.target.files);
    setFiles(fileList);
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(submitHandler)}>
        <Dialog.Title
          as="h2"
          className="text-base font-bold leading-6 text-gray-900 mb-4"
        >
          Edit Task
        </Dialog.Title>

        <div className="mt-2 flex flex-col gap-6">
          <Textbox
            placeholder="Task Title"
            type="text"
            name="title"
            label="Task Title"
            className="w-full rounded"
            defaultValue={task.title}
            register={register("title", { required: "Title is required" })}
            error={errors.title ? errors.title.message : ""}
          />
          <UserList setTeam={setTeam} team={team} />{" "}
          {/* Add UserList component */}
          <div className="flex gap-4">
            <SelectList
              label="Task Stage"
              lists={LISTS}
              selected={stage}
              setSelected={setStage}
            />

            <div className="w-full">
              <Textbox
                placeholder="Date"
                type="date"
                name="date"
                label="Task Date"
                className="w-full rounded"
                register={register("date", {
                  required: "Date is required!",
                })}
                error={errors.date ? errors.date.message : ""}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <SelectList
              label="Priority Level"
              lists={PRIORIRY}
              selected={priority}
              setSelected={setPriority}
            />

            <div className="w-full flex items-center justify-center mt-4">
              <label
                className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4"
                htmlFor="imgUpload"
              >
                <input
                  type="file"
                  className="hidden"
                  id="imgUpload"
                  onChange={(e) => handleSelect(e)}
                  accept=".jpg, .png, .jpeg"
                  multiple={true}
                />
                <BiImages />
                <span>Add Assets</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 py-6 sm:flex sm:flex-row-reverse gap-4">
          <Button
            type="submit"
            label="Update"
            className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700  sm:w-auto"
          />
          <Button
            type="button"
            onClick={() => setOpen(false)}
            label="Cancel"
            className="bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto"
          />
        </div>
      </form>
    </ModalWrapper>
  );
};

export default EditTask;
