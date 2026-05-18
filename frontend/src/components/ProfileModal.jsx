import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dialog } from "@headlessui/react";
import { toast } from "sonner";
import { MdOutlineClose } from "react-icons/md";
import ModalWrapper from "./ModalWrapper";
import Textbox from "./Textbox";
import Button from "./Button";
import { useForm } from "react-hook-form";
import { getInitials } from "../utils";
import api from "../utils/api";
import { setCredentials } from "../redux/slices/authSlice";

const ProfileModal = ({ open, setOpen }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username:    user?.username    ?? "",
      email:       user?.email       ?? "",
      designation: user?.designation ?? "",
    },
  });

  const submitHandler = async (data) => {
    setIsSubmitting(true);
    try {
      // ✅ FIX 1: Correct route is PATCH /users/:id  — backend has no /users/profile route
      // ✅ FIX 2: Field names match backend's allowedUpdates: ['username','email','designation']
      const { data: updated } = await api.patch(`/users/${user._id}`, {
        username:    data.username,
        email:       data.email,
        designation: data.designation,
      });

      // Keep token & role intact; overwrite only what the server returned
      dispatch(setCredentials({ ...user, ...updated }));
      toast.success("Profile updated successfully");
      setOpen(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        "Failed to update profile"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(submitHandler)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Dialog.Title as="h2" className="text-base font-bold text-gray-900">
            My Profile
          </Dialog.Title>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50 rounded-xl">
          <div className="w-16 h-16 bg-blue-600 rounded-full text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {getInitials(user?.username || user?.email || "U")}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {user?.username || "User"}
            </p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full capitalize">
              {user?.role ?? "member"}
            </span>
          </div>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <Textbox
            label="Username"
            name="username"
            type="text"
            placeholder="Your username"
            className="w-full rounded-lg"
            register={register("username", { required: "Username is required" })}
            error={errors.username?.message ?? ""}
          />
          <Textbox
            label="Email"
            name="email"
            type="email"
            placeholder="Your email"
            className="w-full rounded-lg"
            register={register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
            })}
            error={errors.email?.message ?? ""}
          />
          <Textbox
            label="Designation / Title"
            name="designation"
            type="text"
            placeholder="e.g. Frontend Developer"
            className="w-full rounded-lg"
            register={register("designation")}
            error=""
          />
        </div>

        {/* Actions */}
        <div className="flex flex-row-reverse gap-3 pt-6 mt-2 border-t border-gray-100">
          <Button
            type="submit"
            label={isSubmitting ? "Saving…" : "Save Changes"}
            className="bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
          />
          <Button
            type="button"
            onClick={() => setOpen(false)}
            label="Cancel"
            className="bg-white px-5 text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50"
          />
        </div>
      </form>
    </ModalWrapper>
  );
};

export default ProfileModal;
