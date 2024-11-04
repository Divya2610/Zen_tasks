import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice"; // Import the auth reducer
import { apiSlice } from "./slices/apiSlice"; // Import the API slice

const store = configureStore({
  reducer: {
    // Add the API slice reducer using its dynamic reducer path
    [apiSlice.reducerPath]: apiSlice.reducer,
    
    // Add the auth reducer for managing authentication state
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    // Add the API middleware to handle async API calls
    getDefaultMiddleware().concat(apiSlice.middleware),
  
  // Enable Redux DevTools for development debugging
  devTools: true,
});

export default store;
