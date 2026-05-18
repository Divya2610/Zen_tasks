
// ✅ Full replacement — reads from Redux like Navbar, Sidebar, UserAvatar all do
import { useSelector } from "react-redux";
import { getInitials } from "../utils";

const UserProfile = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
      <div className="w-16 h-16 bg-blue-600 rounded-full text-white flex items-center justify-center text-2xl font-bold">
        {getInitials(user.username || user.email || "U")}
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-black">
          {user.username || "User"}
        </h2>
        <span className="text-gray-500">{user.designation || ""}</span>
        <span className="text-blue-500 text-sm">{user.email}</span>
      </div>
    </div>
  );
};

export default UserProfile;

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useEffect, useState } from 'react';

// const UserProfile = () => {
//   const [username, setUsername] = useState('');

//   const fetchUsername = async () => {
//     try {
//       const storedUsername = await AsyncStorage.getItem('username');
//       if (storedUsername) {
//         setUsername(storedUsername);
//       }
//     } catch (error) {
//       console.error("Error fetching username:", error);
//     }
//   };

//   useEffect(() => {
//     fetchUsername();
//   }, []);

//   return (
//     <div>
//       <h1>Welcome, {username}!</h1>
//       {/* Additional user profile information */}
//     </div>
//   );
// };

// export default UserProfile;
