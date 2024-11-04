import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { useSelector } from "react-redux";
import axios from "axios";

const Signup = () => {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const { user } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const submitHandler = async (formData) => {
    try {
      const response = await axios.post(
        "http://localhost:5001/signup",
        formData
      );

      console.log(response.data.message);
      navigate("/log-in");
    } catch (error) {
      console.error("Error registering user:", error.message );
    }
  };

  const checkUserExists = async () => {
    try {
      // Check if the user already exists by sending a request to your backend
      const response = await axios.get(`http://localhost:5001/users?email=${email}`);
      return response.data.length > 0; // Assuming the response contains a list of users
    } catch (error) {
      console.error("Error checking user existence:", error.message);
      return false;
    }
  };2

  const handleSignInRedirect = async () => {
    const userExists = await checkUserExists();
    if (userExists) {
      navigate("/log-in");
    } else {
      alert("No account found for this email.");
    }
  };

  useEffect(() => {
    if (user) navigate("/sign-up");
  }, [user, navigate]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6]">
      <div className="w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center">
        {/* left side */}
        <div className="h-full w-full lg:w-2/3 flex flex-col items-center justify-center">
          <div className="w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20">
            <span className="flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base bordergray-300 text-gray-600">
              Manage all your task in one place!
            </span>
            <p className="flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-blue-700">
              <span>Cloud-Based</span>
              <span>Task Manager</span>
            </p>

            <div className="cell">
              <div className="circle rotate-in-up-left"></div>
            </div>
          </div>
        </div>

        {/* right side */}
        <div className="w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center">
          <form
            onSubmit={handleSubmit(submitHandler)}
            className="form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white px-10 pt-14 pb-14"
          >
            <div className="">
              <p className="text-blue-600 text-3xl font-bold text-center">
                Sign Up
              </p>
              <p className="text-center text-base text-gray-700 ">
                Manage all your task in one place!
              </p>
            </div>

            <div className="flex flex-col gap-y-5">
              <Textbox
                placeholder="Enter Name"
                type="text"
                name="username"
                value={username}
                onChange={(e) => setName(e.target.value)}
                label="Name"
                className="w-full rounded-full"
                register={register("username", {
                  required: "Name is required!",
                })}
                error={errors.username ? errors.username.message : ""}
              />
              <Textbox
                placeholder="email@example.com"
                type="email"
                name="email"
                label="Email Address"
                className="w-full rounded-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                register={register("email", {
                  required: "Email Address is required!",
                })}
                error={errors.email ? errors.email.message : ""}
              />
              <Textbox
                placeholder="Eg: Frontend, mongoDB, etc.."
                type="text"
                name="designation"
                label="Designation"
                className="w-full rounded-full"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                register={register("designation", {
                  required: "Designation is required!",
                })}
                error={errors.designation ? errors.designation.message : ""}
              />
              <Textbox
                placeholder="Your Password"
                type="password"
                name="password"
                label="Password"
                className="w-full rounded-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                register={register("password", {
                  required: "Password is required!",
                })}
                error={errors.password ? errors.password.message : ""}
              />

              <div className="flex flex-col mb-4">
                <label htmlFor="role" className="text-sm font-semibold text-gray-700">Select Role</label>                  
                <select id="role"
                  {...register("role", { required: "Role is required!" })}
                  className="border border-gray-300 rounded-full px-4 py-2"
                >
                  <option value="">Select role</option>
                  <option value="admin">Admin</option>
                  <option value="team_member">Team Member</option>
                </select>
                {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
              </div>

              <Button
                type="submit"
                label="Sign up"
                className="w-full h-10 bg-blue-700 text-white rounded-full"
              />
              <p 
                className="text-center text-sm text-gray-600 mt-4 cursor-pointer"
                onClick={handleSignInRedirect} // Use onClick for the redirect
              >
                Already have an account? <span className="text-blue-700 hover:underline">Sign in</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
