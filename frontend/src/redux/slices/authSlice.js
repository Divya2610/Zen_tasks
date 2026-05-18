import { createSlice } from "@reduxjs/toolkit";

const getUserFromStorage = () => {
  try {
    const data = localStorage.getItem("userInfo");
    return data ? JSON.parse(data) : null;
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
      state.user = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
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
