import React, { useState, useEffect } from "react";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import { getInitials } from "../utils/index";
import clsx from "clsx";
import ConfirmatioDialog, { UserAction } from "../components/Dialogs";
import AddUser from "../components/AddUser";
import axios from "axios";

const Users = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAction, setOpenAction] = useState(false);
  const [selected, setSelected] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

const fetchUsers = async () => {
  try {
    // ✅ uses api.js — no hardcoded URL
    const { data } = await api.get("/users");
    setUsers(data);
  } catch (error) {
    toast.error("Failed to load users");
  }
};

  useEffect(() => {
    fetchUsers();
  }, []);

  // FIX: was only filtering from local state — now calls DELETE API first, then updates state
const deleteHandler = async () => {
  try {
    // ✅ Fixed: was only updating local state — never called the API
    await api.delete(`/users/${selected}`);
    setUsers((prev) => prev.filter((u) => u._id !== selected));
    toast.success("User deleted");
  } catch (error) {
    toast.error("Failed to delete user");
  } finally {
    setOpenDialog(false);
    setSelected(null);
  }
};

  // FIX: was an empty function () => {} — now toggles the user's isActive status via API
  const userActionHandler = async () => {
  try {
    const { data } = await api.patch(`/users/${selected._id}/toggle-active`);
    setUsers((prev) =>
      prev.map((u) => (u._id === data._id ? data : u))
    );
    toast.success("User status updated");
  } catch (error) {
    toast.error("Failed to update user status");
  } finally {
    setOpenAction(false);
  }
};

  const deleteClick = (id) => {
    setSelected(id);
    setOpenDialog(true);
  };

  const editClick = (user) => {
    setSelected(user);
    setOpen(true);
  };

  const TableHeader = () => (
    <thead className="border-b border-gray-300">
      <tr className="text-black text-left">
        <th className="py-2">Full Name</th>
        <th className="py-2">Title</th>
        <th className="py-2">Email</th>
        <th className="py-2">User ID</th>
        <th className="py-2">Active</th>
        <th className="py-2">Actions</th>
      </tr>
    </thead>
  );

  const TableRow = ({ user }) => (
    <tr className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10">
      <td className="p-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-blue-700">
            <span className="text-xs md:text-sm text-center">
              {getInitials(user.username || "")}
            </span>
          </div>
          {user.username}
        </div>
      </td>
      <td className="p-2">{user.designation}</td>
      <td className="p-2">{user.email}</td>
      <td className="p-2">{user._id}</td>
      <td className="p-2">
        <button
          className={clsx(
            "w-fit px-4 py-1 rounded-full",
            user?.isActive ? "bg-blue-200" : "bg-yellow-100"
          )}
          onClick={() => {
            setSelected(user);
            setOpenAction(true);
          }}
        >
          {user?.isActive ? "Active" : "Disabled"}
        </button>
      </td>
      <td className="p-2 flex gap-4 justify-end">
        <Button
          className="text-blue-600 hover:text-blue-500 font-semibold sm:px-0"
          label="Edit"
          type="button"
          onClick={() => editClick(user)}
        />
        <Button
          className="text-red-700 hover:text-red-500 font-semibold sm:px-0"
          label="Delete"
          type="button"
          onClick={() => deleteClick(user._id)}
        />
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="py-10 flex justify-center">
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchUsers}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full md:px-1 px-0 mb-6">
        <div className="flex items-center justify-between mb-8">
          <Title title="Team Members" />
          <Button
            label="Add New User"
            icon={<IoMdAdd className="text-lg" />}
            className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md 2xl:py-2.5"
            onClick={() => {
              setSelected(null);
              setOpen(true);
            }}
          />
        </div>
        <div className="bg-white px-2 md:px-4 py-4 shadow-md rounded">
          <div className="overflow-x-auto">
            {users.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No users found.</p>
            ) : (
              <table className="w-full mb-5">
                <TableHeader />
                <tbody>
                  {users.map((user) => (
                    <TableRow key={user._id} user={user} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <AddUser
        open={open}
        setOpen={setOpen}
        userData={selected}
        key={new Date().getTime().toString()}
        onSuccess={fetchUsers}
      />

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
        userId={selected}
      />

      <UserAction
        open={openAction}
        setOpen={setOpenAction}
        onClick={userActionHandler}
      />
    </>
  );
};

export default Users;


// import React, { useState, useEffect } from "react";
// import Title from "../components/Title";
// import Button from "../components/Button";
// import { IoMdAdd } from "react-icons/io";
// import { getInitials } from "../utils/index";
// import clsx from "clsx";
// import ConfirmatioDialog, { UserAction } from "../components/Dialogs";
// import AddUser from "../components/AddUser";
// import axios from "axios"; // Import Axios for making HTTP requests

// const Users = () => {
//   const [openDialog, setOpenDialog] = useState(false);
//   const [open, setOpen] = useState(false);
//   const [openAction, setOpenAction] = useState(false);
//   const [selected, setSelected] = useState(null);
//   const [users, setUsers] = useState([]); // State to hold fetched users

//   useEffect(() => {
//     // Fetch users when component mounts
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const response = await axios.get("http://localhost:5001/users");
//       setUsers(response.data); // Set fetched users to state
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   };

//   const userActionHandler = () => {};
//   const deleteHandler = () => {
//     setUsers((prevUsers) => prevUsers.filter(user => user._id !== selected));
//      setOpenDialog(false); // Close the dialog
//     setSelected(null); // Reset selected user
//   };

//   const deleteClick = (id) => {
//     console.log("Deleting user with ID:", id);
//     setSelected(id);
//     setOpenDialog(true);
//   };

//   const editClick = (user) => {
//     setSelected(user);
//     setOpen(true);
//   };

//   const TableHeader = () => (
//     <thead className="border-b border-gray-300">
//       <tr className="text-black text-left">
//         <th className="py-2">Full Name</th>
//         <th className="py-2">Title</th>
//         <th className="py-2">Email</th>
//         <th className="py-2">User_id</th>
//         <th className="py-2">Active</th>
//       </tr>
//     </thead>
//   );

//   const TableRow = ({ user }) => (
//     <tr className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10">
//       <td className="p-2">
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-blue-700">
//             <span className="text-xs md:text-sm text-center">
//               {getInitials(user.username || "")}
//             </span>
//           </div>
//           {user.username}
//         </div>
//       </td>
//       <td className="p-2">{user.designation}</td>
//       <td className="p-2">{user.email}</td>
//       <td className="p-2">{user._id}</td> 
//       <td>
//         <button
//           className={clsx(
//             "w-fit px-4 py-1 rounded-full",
//             user?.isActive ? "bg-blue-200" : "bg-yellow-100"
//           )}
//         >
//           {user?.isActive ? "Active" : "Disabled"}
//         </button>
//       </td>
//       <td className="p-2 flex gap-4 justify-end">
//         <Button
//           className="text-blue-600 hover:text-blue-500 font-semibold sm:px-0"
//           label="Edit"
//           type="button"
//           onClick={() => editClick(user)}
//         />
//         <Button
//           className="text-red-700 hover:text-red-500 font-semibold sm:px-0"
//           label="Delete"
//           type="button"
//           onClick={() => deleteClick(user._id)}
//         />
//       </td>
//     </tr>
//   );

//   return (
//     <>
//       <div className="w-full md:px-1 px-0 mb-6">
//         <div className="flex items-center justify-between mb-8">
//           <Title title="  Team Members" />
//           <Button
//             label="Add New User"
//             icon={<IoMdAdd className="text-lg" />}
//             className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md 2xl:py-2.5"
//             onClick={() => setOpen(true)}
//           />
//         </div>
//         <div className="bg-white px-2 md:px-4 py-4 shadow-md rounded">
//           <div className="overflow-x-auto">
//             <table className="w-full mb-5">
//               <TableHeader />
//               <tbody>
//                 {users.map((user) => (
//                   <TableRow key={user._id} user={user} />
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//       <AddUser
//         open={open}
//         setOpen={setOpen}
//         userData={selected}
//         key={new Date().getTime().toString()}
//       />
//       <ConfirmatioDialog
//         open={openDialog}
//         setOpen={setOpenDialog}
//         onClick={deleteHandler}
//         userId={selected}  
//       />
//       <UserAction
//         open={openAction}
//         setOpen={setOpenAction}
//         onClick={userActionHandler}
//       />
//     </>
//   );
// };

// export default Users;