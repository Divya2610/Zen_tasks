import React, { useEffect } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setOpenSidebar, logout } from "../redux/slices/authSlice"; // Add logout action
import UserAvatar from "./UserAvatar";
import NotificationPanel from "./NotificationPanel";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth); // Ensure user is properly fetched from Redux
  const dispatch = useDispatch();

  // Debugging: Log the user data to ensure it's coming from Redux properly
  useEffect(() => {
    console.log("User data:", user);
  }, [user]);

  // Handle logout
  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action
  };

  return (
    <div className='flex justify-between items-center bg-white px-4 py-3 2xl:py-4 sticky z-10 top-0'>
      <div className='flex gap-4'>
        <button
          onClick={() => dispatch(setOpenSidebar(true))}
          className='text-2xl text-gray-500 block md:hidden'
        >
          ☰
        </button>

        <div className='w-64 2xl:w-[400px] flex items-center py-2 px-3 gap-2 rounded-full bg-[#f3f4f6]'>
          <MdOutlineSearch className='text-gray-500 text-xl' />

          <input
            type='text'
            placeholder='Search....'
            className='flex-1 outline-none bg-transparent placeholder:text-gray-500 text-gray-800'
          />
        </div>
      </div>

      <div className='flex gap-4 items-center'>
        {/* Show user's name or email if available */}
        {user ? (
          <>
            <span className='text-gray-700 font-semibold'>
              Hello, {user.name || user.email || "User"}
            </span>

            {/* Notification Panel */}
            <NotificationPanel />

            {/* User Avatar */}
            <UserAvatar />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className='bg-red-500 text-white px-4 py-2 rounded-full text-sm'
            >
              Logout
            </button>
          </>
        ) : (
          <span className='text-gray-700'>Welcome, Guest!</span>
        )}
      </div>
    </div>
  );
};

export default Navbar;
