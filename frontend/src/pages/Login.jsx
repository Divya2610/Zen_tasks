import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { setCredentials } from "../redux/slices/authSlice";
import { toast } from "sonner";
import api from "../utils/api";

const Login = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const submitHandler = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post("/signin", {
        email: data.email,
        password: data.password,
      });

      const userData = response.data?.user || response.data;

      if (!userData || (!userData._id && !userData.id)) {
        toast.error("Login failed: unexpected response from server");
        return;
      }

      dispatch(setCredentials(userData));
      toast.success("Login successful");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error?.response?.data || error.message);
      toast.error(
        error?.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6]">
      <div className="w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center">
        {/* Left side */}
        <div className="h-full w-full lg:w-2/3 flex flex-col items-center justify-center">
          <div className="w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20">
            <span className="flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base border-gray-300 text-gray-600">
              Manage all your tasks in one place!
            </span>
            <p className="flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-blue-700">
              <span>Cloud-Based</span>
              <span>Task Manager</span>
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center">
          <form
            onSubmit={handleSubmit(submitHandler)}
            className="w-full md:w-[400px] flex flex-col gap-y-8 bg-white px-10 pt-14 pb-14"
          >
            <div>
              <p className="text-blue-600 text-3xl font-bold text-center">
                Welcome back!
              </p>
              <p className="text-center text-base text-gray-700">
                Keep all your credentials safe.
              </p>
            </div>

            <div className="flex flex-col gap-y-5">
              <Textbox
                placeholder="email@example.com"
                type="email"
                name="email"
                label="Email Address"
                className="w-full rounded-full"
                register={register("email", {
                  required: "Email is required!",
                })}
                error={errors.email?.message || ""}
              />
              <Textbox
                placeholder="Your password"
                type="password"
                name="password"
                label="Password"
                className="w-full rounded-full"
                autoComplete="current-password"
                register={register("password", {
                  required: "Password is required!",
                })}
                error={errors.password?.message || ""}
              />

              <Button
                type="submit"
                label={isLoading ? "Signing in..." : "Sign In"}
                className="w-full h-10 bg-blue-700 text-white rounded-full"
              />

              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <span
                  className="text-blue-700 hover:underline cursor-pointer"
                  onClick={() => navigate("/sign-up")}
                >
                  Sign up
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
