import { createSlice } from "@reduxjs/toolkit";
import { normalizeRole } from "../../utils/role";

const getUserFromStorage = () => {
  try {
    const data = localStorage.getItem("userInfo");
    if (!data) return null;
    const user = JSON.parse(data);
    return { ...user, role: normalizeRole(user) };
  } catch {
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  isSidebarOpen: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const user = { ...action.payload, role: normalizeRole(action.payload) };
      state.user = user;
      localStorage.setItem("userInfo", JSON.stringify(user));
    },

    logout: (state) => {
      state.user = null;
      // ✅ Only "userInfo" exists now — "token" was part of the old Bearer flow
      // and is no longer stored anywhere. Cookie is cleared server-side via
      // res.clearCookie("access_token") in the /signout route.
      localStorage.removeItem("userInfo");
    },

    setOpenSidebar: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
  },
});

export const { setCredentials, logout, setOpenSidebar } = authSlice.actions;

export default authSlice.reducer;
