import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "./Textbox";
import Loading from "./Loader";
import Button from "./Button";
import { toast } from "sonner";
import api from "../utils/api"; // ✅ centralized API, no hardcoded URL

const AddUser = ({ open, setOpen, userData, onSuccess }) => {
  const defaultValues = userData ?? {};
  const { user } = useSelector((state) => state.auth);

  // ✅ Fixed: was hardcoded false — now real loading state
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const handleOnSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (userData) {
        // Update existing user
        await api.patch(`/users/${userData._id}`, data);
        toast.success("User updated successfully");
      } else {
        // Create new user
        await api.post("/users", data);
        toast.success("User created successfully");
      }
      reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      // ✅ Fixed: was console.error only — now user sees the error
      toast.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(handleOnSubmit)} className="">
        <Dialog.Title as="h2" className="text-base font-bold leading-6 text-gray-900 mb-4">
          {userData ? "UPDATE PROFILE" : "ADD NEW USER"}
        </Dialog.Title>

        <div className="mt-2 flex flex-col gap-6">
          <Textbox
            placeholder="Full name"
            type="text"
            name="username"
            label="Full Name"
            className="w-full rounded"
            register={register("username", { required: "Full name is required!" })}
            error={errors.username?.message || ""}
          />
          <Textbox
            placeholder="Title / Designation"
            type="text"
            name="designation"
            label="Title"
            className="w-full rounded"
            register={register("designation", { required: "Title is required!" })}
            error={errors.designation?.message || ""}
          />
          <Textbox
            placeholder="Email Address"
            type="email"
            name="email"
            label="Email Address"
            className="w-full rounded"
            register={register("email", { required: "Email is required!" })}
            error={errors.email?.message || ""}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Login Role
            </label>
            <select
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
              {...register("role", { required: "Role is required!" })}
              defaultValue={userData?.role || "member"}
            >
              <option value="member">Team member</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role?.message && (
              <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>
          {/* ✅ Only show password field when creating a new user */}
          {!userData && (
            <Textbox
              placeholder="Password"
              type="password"
              name="password"
              label="Password"
              className="w-full rounded"
              register={register("password", { required: "Password is required!" })}
              error={errors.password?.message || ""}
            />
          )}
        </div>

        {/* ✅ Fixed: loader now actually shows when isLoading is true */}
        {isLoading ? (
          <div className="py-5">
            <Loading />
          </div>
        ) : (
          <div className="py-3 mt-4 sm:flex sm:flex-row-reverse gap-4">
            <Button
              type="submit"
              className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
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
  );
};

export default AddUser;

// import React from "react";
// import { useForm } from "react-hook-form";
// import { useSelector } from "react-redux";
// import axios from "axios"; // Import Axios
// import ModalWrapper from "./ModalWrapper";
// import { Dialog } from "@headlessui/react";
// import Textbox from "./Textbox";
// import Loading from "./Loader";
// import Button from "./Button";

// const AddUser = ({ open, setOpen, userData }) => {
//   let defaultValues = userData ?? {};
//   const { user } = useSelector((state) => state.auth);

//   const isLoading = false,
//     isUpdating = false;

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({ defaultValues });

//   const handleOnSubmit = async (data) => {
//     try {
//       await axios.post("http://localhost:5001/signup", data); // Make POST request to /signup endpoint
//       // Handle success (e.g., show success message)
//       console.log("User created successfully");
//     } catch (error) {
//       // Handle error (e.g., show error message)
//       console.error("Error creating user:", error);
//     }
//   };

//   return (
//     <>
//       <ModalWrapper open={open} setOpen={setOpen}>
//         <form onSubmit={handleSubmit(handleOnSubmit)} className="">
//           <Dialog.Title
//             as="h2"
//             className="text-base font-bold leading-6 text-gray-900 mb-4"
//           >
//             {userData ? "UPDATE PROFILE" : "ADD NEW USER"}
//           </Dialog.Title>
//           <div className="mt-2 flex flex-col gap-6">
//             <Textbox
//               placeholder="Full name"
//               type="text"
//               name="username" // Change name to match the backend model
//               label="Full Name"
//               className="w-full rounded"
//               register={register("username", { // Change register to match the backend model
//                 required: "Full name is required!",
//               })}
//               error={errors.username ? errors.username.message : ""}
//             />
//             <Textbox
//               placeholder="Title"
//               type="text"
//               name="designation" // Change name to match the backend model
//               label="Title"
//               className="w-full rounded"
//               register={register("designation", { // Change register to match the backend model
//                 required: "Title is required!",
//               })}
//               error={errors.designation ? errors.designation.message : ""}
//             />
//             <Textbox
//               placeholder="Email Address"
//               type="email"
//               name="email" // Change name to match the backend model
//               label="Email Address"
//               className="w-full rounded"
//               register={register("email", {
//                 required: "Email Address is required!",
//               })}
//               error={errors.email ? errors.email.message : ""}
//             />
//             <Textbox
//               placeholder="Password"
//               type="password"
//               name="password" // Add password field
//               label="Password"
//               className="w-full rounded"
//               register={register("password", {
//                 required: "Password is required!",
//               })}
//               error={errors.password ? errors.password.message : ""}
//             />
//           </div>

//           {isLoading || isUpdating ? (
//             <div className="py-5">
//               <Loading />
//             </div>
//           ) : (
//             <div className="py-3 mt-4 sm:flex sm:flex-row-reverse">
//               <Button
//                 type="submit"
//                 className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700  sm:w-auto"
//                 label="Submit"
//               />
//               <Button
//                 type="button"
//                 className="bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto"
//                 onClick={() => setOpen(false)}
//                 label="Cancel"
//               />
//             </div>
//           )}
//         </form>
//       </ModalWrapper>
//     </>
//   );
// };

// export default AddUser;
