import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// FIX: was hardcoded string — now reads from env variable with fallback
const API_URI = import.meta.env.VITE_API_URL || "http://localhost:5001";

const baseQuery = fetchBaseQuery({
  baseUrl: API_URI,

  // FIX: added prepareHeaders to inject JWT Bearer token into every protected API request
  prepareHeaders: (headers, { getState }) => {
    // First try to get token from Redux state (set after login)
    const token = getState()?.auth?.user?.token;

    // Fallback: read from localStorage (persisted across page refreshes)
    const localToken = token || localStorage.getItem("token");

    if (localToken) {
      headers.set("Authorization", `Bearer ${localToken}`);
    }

    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,

  // FIX: tagTypes was empty [] — added core entity tags for cache invalidation strategy
  // Add a tag here for every resource type your endpoints will manage
  tagTypes: ["Tasks", "Users", "Dashboard"],

  endpoints: (builder) => ({}),
});


// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// const API_URI = "http://localhost:8800/api";

// const baseQuery = fetchBaseQuery({ baseUrl: API_URI });

// export const apiSlice = createApi({
//   baseQuery,
//   tagTypes: [],
//   endpoints: (builder) => ({}),
// });
