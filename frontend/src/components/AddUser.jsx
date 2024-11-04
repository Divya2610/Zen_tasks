import React from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import axios from "axios"; // Import Axios
import ModalWrapper from "./ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "./Textbox";
import Loading from "./Loader";
import Button from "./Button";

const AddUser = ({ open, setOpen, userData }) => {
  let defaultValues = userData ?? {};
  const { user } = useSelector((state) => state.auth);

  const isLoading = false,
    isUpdating = false;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const handleOnSubmit = async (data) => {
    try {
      await axios.post("http://localhost:5001/signup", data); // Make POST request to /signup endpoint
      // Handle success (e.g., show success message)
      console.log("User created successfully");
    } catch (error) {
      // Handle error (e.g., show error message)
      console.error("Error creating user:", error);
    }
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className="">
          <Dialog.Title
            as="h2"
            className="text-base font-bold leading-6 text-gray-900 mb-4"
          >
            {userData ? "UPDATE PROFILE" : "ADD NEW USER"}
          </Dialog.Title>
          <div className="mt-2 flex flex-col gap-6">
            <Textbox
              placeholder="Full name"
              type="text"
              name="username" // Change name to match the backend model
              label="Full Name"
              className="w-full rounded"
              register={register("username", { // Change register to match the backend model
                required: "Full name is required!",
              })}
              error={errors.username ? errors.username.message : ""}
            />
            <Textbox
              placeholder="Title"
              type="text"
              name="designation" // Change name to match the backend model
              label="Title"
              className="w-full rounded"
              register={register("designation", { // Change register to match the backend model
                required: "Title is required!",
              })}
              error={errors.designation ? errors.designation.message : ""}
            />
            <Textbox
              placeholder="Email Address"
              type="email"
              name="email" // Change name to match the backend model
              label="Email Address"
              className="w-full rounded"
              register={register("email", {
                required: "Email Address is required!",
              })}
              error={errors.email ? errors.email.message : ""}
            />
            <Textbox
              placeholder="Password"
              type="password"
              name="password" // Add password field
              label="Password"
              className="w-full rounded"
              register={register("password", {
                required: "Password is required!",
              })}
              error={errors.password ? errors.password.message : ""}
            />
          </div>

          {isLoading || isUpdating ? (
            <div className="py-5">
              <Loading />
            </div>
          ) : (
            <div className="py-3 mt-4 sm:flex sm:flex-row-reverse">
              <Button
                type="submit"
                className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700  sm:w-auto"
                label="Submit"
              />
              <Button
                type="button"
                className="bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto"
                onClick={() => setOpen(false)}
                label="Cancel"
              />
            </div>
          )}
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddUser;
