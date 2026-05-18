import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaUser, FaUserLock } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { getInitials } from "../utils";
import { handleLogout } from "../utils/logout";
// ✅ FIX: import the two modals that were missing from the JSX entirely
import ProfileModal from "./ProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";

const UserAvatar = () => {
  const [open, setOpen]                 = useState(false); // Profile
  const [openPassword, setOpenPassword] = useState(false); // Change Password

  const { user } = useSelector((state) => state.auth);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const logoutHandler = () => handleLogout(dispatch, navigate);

  const userInitials = user?.username
    ? getInitials(user.username)
    : user?.email
    ? getInitials(user.email)
    : "U";

  return (
    <>
      <div>
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="w-10 h-10 2xl:w-12 2xl:h-12 flex items-center justify-center rounded-full bg-blue-600">
            <span className="text-white font-semibold">{userInitials}</span>
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-gray-100 rounded-md bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none">
              <div className="p-4">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setOpen(true)}
                      className={`${
                        active ? "bg-gray-50" : ""
                      } text-gray-700 group flex w-full items-center rounded-md px-2 py-2 text-base`}
                    >
                      <FaUser className="mr-2" />
                      Profile
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setOpenPassword(true)}
                      className={`${
                        active ? "bg-gray-50" : ""
                      } text-gray-700 group flex w-full items-center rounded-md px-2 py-2 text-base`}
                    >
                      <FaUserLock className="mr-2" />
                      Change Password
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logoutHandler}
                      className={`${
                        active ? "bg-gray-50" : ""
                      } text-red-600 group flex w-full items-center rounded-md px-2 py-2 text-base`}
                    >
                      <IoLogOutOutline className="mr-2" />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      {/*
        ✅ THE ACTUAL FIX:
        These two modals were never rendered in the original component.
        open/openPassword state was being set but nothing was listening to it,
        so clicking Profile or Change Password appeared to do nothing.
      */}
      <ProfileModal        open={open}         setOpen={setOpen}         />
      <ChangePasswordModal open={openPassword} setOpen={setOpenPassword} />
    </>
  );
};

export default UserAvatar;
