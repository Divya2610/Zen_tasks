import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Dialog } from "@headlessui/react";
import { toast } from "sonner";
import { MdOutlineClose, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FaUserLock } from "react-icons/fa";
import { useForm } from "react-hook-form";
import ModalWrapper from "./ModalWrapper";
import Textbox from "./Textbox";
import Button from "./Button";
import api from "../utils/api";

const PasswordField = ({ label, name, register, error, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Textbox
        label={label}
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className="w-full rounded-lg pr-10"
        register={register}
        error={error}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
      >
        {show ? <MdVisibilityOff /> : <MdVisibility />}
      </button>
    </div>
  );
};

const ChangePasswordModal = ({ open, setOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword");

  const submitHandler = async (data) => {
    setIsSubmitting(true);
    try {
      // ✅ FIX: Backend has NO /users/change-password route (caused 404).
      //
      // The backend's updateUser handler (PATCH /users/:id) accepts 'password'
      // in allowedUpdates and calls user.save() — which means if you hash here
      // and the model also hashes via a pre-save hook you'll double-hash.
      //
      // Strategy used here:
      //   1. First verify the current password by calling POST /signin with
      //      the stored email + currentPassword.  A 401 means wrong password.
      //   2. Only if that succeeds, PATCH /users/:id with the new password
      //      (plain-text — let the backend/model hash it via bcrypt pre-save,
      //       OR the updateUser controller hashes it before save).
      //
      // ⚠️  If your User model does NOT have a bcrypt pre-save hook, add one
      //      (see user-controller.js note below) so plain-text is never stored.

      // Step 1 — verify current password
      try {
        await api.post("/signin", {
          email:    user.email,
          password: data.currentPassword,
        });
      } catch (verifyErr) {
        const status = verifyErr?.response?.status;
        if (status === 401 || status === 404) {
          toast.error("Current password is incorrect");
          return;
        }
        throw verifyErr; // unexpected error — fall through to outer catch
      }

      // Step 2 — update password via the existing PATCH /users/:id route
      await api.patch(`/users/${user._id}`, {
        password: data.newPassword,
      });

      toast.success("Password changed successfully");
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        "Failed to change password"
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaUserLock className="text-blue-600 text-sm" />
            </div>
            <Dialog.Title as="h2" className="text-base font-bold text-gray-900">
              Change Password
            </Dialog.Title>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </div>

        {/* Info banner */}
        <div className="mb-5 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700">
          Your new password must be at least 6 characters long.
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <PasswordField
            label="Current Password"
            name="currentPassword"
            placeholder="Enter current password"
            register={register("currentPassword", {
              required: "Current password is required",
            })}
            error={errors.currentPassword?.message ?? ""}
          />

          <PasswordField
            label="New Password"
            name="newPassword"
            placeholder="Enter new password"
            register={register("newPassword", {
              required: "New password is required",
              minLength: { value: 6, message: "Must be at least 6 characters" },
            })}
            error={errors.newPassword?.message ?? ""}
          />

          <PasswordField
            label="Confirm New Password"
            name="confirmPassword"
            placeholder="Re-enter new password"
            register={register("confirmPassword", {
              required: "Please confirm your password",
              validate: (val) =>
                val === newPassword || "Passwords do not match",
            })}
            error={errors.confirmPassword?.message ?? ""}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-row-reverse gap-3 pt-6 mt-2 border-t border-gray-100">
          <Button
            type="submit"
            label={isSubmitting ? "Updating…" : "Update Password"}
            className="bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
          />
          <Button
            type="button"
            onClick={() => { reset(); setOpen(false); }}
            label="Cancel"
            className="bg-white px-5 text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50"
          />
        </div>
      </form>
    </ModalWrapper>
  );
};

export default ChangePasswordModal;
