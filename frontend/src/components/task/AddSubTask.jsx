import { useForm } from "react-hook-form";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import Button from "../Button";
import { useState } from "react";
import { toast } from "sonner";
import { useTasks } from "../../context/TaskContext";
import UserList from "./UserList";

const AddSubTask = ({ open, setOpen, id, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedTo, setAssignedTo]     = useState([]);
  const { addSubTask } = useTasks();   // ✅ context function — not raw api call

  const handleOnSubmit = async (data) => {
    setIsSubmitting(true);
    const success = await addSubTask(id, {
      title:      data.title,
      date:       data.date,
      tag:        data.tag || "",
      assignedTo,                      // plain array of user IDs
    });
    setIsSubmitting(false);

    if (success) {
      toast.success("Sub-task added successfully");
      reset();
      setAssignedTo([]);
      setOpen(false);
      onSuccess?.();
    }
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <Dialog.Title as="h2" className="text-base font-bold leading-6 text-gray-900 mb-4">
          ADD SUB-TASK
        </Dialog.Title>

        <div className="mt-2 flex flex-col gap-5">
          <Textbox
            placeholder="Sub-Task title"
            type="text"
            name="title"
            label="Title"
            className="w-full rounded"
            register={register("title", { required: "Title is required!" })}
            error={errors.title?.message || ""}
          />

          <UserList setTeam={setAssignedTo} team={assignedTo} />

          <div className="flex items-center gap-4">
            <Textbox
              placeholder="Date"
              type="date"
              name="date"
              label="Task Date"
              className="w-full rounded"
              register={register("date", { required: "Date is required!" })}
              error={errors.date?.message || ""}
            />
            <Textbox
              placeholder="Tag (e.g. Design)"
              type="text"
              name="tag"
              label="Tag"
              className="w-full rounded"
              register={register("tag")}
              error={errors.tag?.message || ""}
            />
          </div>
        </div>

        <div className="py-3 mt-4 flex sm:flex-row-reverse gap-4">
          <Button
            type="submit"
            className="bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 sm:ml-3 sm:w-auto"
            label={isSubmitting ? "Adding..." : "Add Sub-Task"}
          />
          <Button
            type="button"
            className="bg-white border text-sm font-semibold text-gray-900 sm:w-auto"
            onClick={() => { reset(); setOpen(false); }}
            label="Cancel"
          />
        </div>
      </form>
    </ModalWrapper>
  );
};

export default AddSubTask;
