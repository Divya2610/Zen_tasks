import axios from "axios";

const RAW_API_URI = import.meta.env.VITE_API_URL || "http://localhost:5001";
const API_URI = RAW_API_URI.endsWith("/api")
  ? RAW_API_URI
  : `${RAW_API_URI.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL: API_URI,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("userInfo");
      window.location.href = "/log-in";
    }
    return Promise.reject(error);
  }
);

export default api;


// import axios from "axios";

// const RAW_API_URI = import.meta.env.VITE_API_URL || "http://localhost:5001";
// const API_URI = RAW_API_URI.endsWith("/api")
//   ? RAW_API_URI
//   : `${RAW_API_URI.replace(/\/$/, "")}/api`;

// const api = axios.create({
//   baseURL: API_URI,
//   withCredentials: true,
//   // ✅ NO default Content-Type — let axios/browser set it automatically.
//   // For JSON payloads axios sets "application/json".
//   // For FormData payloads the browser sets "multipart/form-data; boundary=..."
//   // Forcing "application/json" here broke multipart uploads and caused multer
//   // to leave req.body empty, which is why the backend returned
//   // "Title, stage, date, and priority are required".
// });

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("userInfo");
//       window.location.href = "/log-in";
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;
