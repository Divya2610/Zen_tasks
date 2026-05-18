import { useEffect, useRef } from "react";
import { io }               from "socket.io-client";

// Singleton socket — created once per session, shared across the app
let socket = null;

/**
 * useSocket({ userId, onNotification })
 *
 * Call this once at the top level (e.g. Layout or App).
 * Every component that needs notifications subscribes via onNotification.
 *
 * npm install socket.io-client
 */
const useSocket = ({ userId, onNotification }) => {
  const cbRef = useRef(onNotification);
  cbRef.current = onNotification;

  useEffect(() => {
    if (!userId) return;

    // Connect once
    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
        withCredentials: true,
        auth: { userId },          // sent to server middleware
        transports: ["websocket"],
      });
    }

    const handler = (notification) => {
      cbRef.current?.(notification);
    };

    socket.on("notification", handler);

    return () => {
      socket.off("notification", handler);
    };
  }, [userId]);
};

export default useSocket;

// ─── Usage (in Layout.jsx or wherever you have the logged-in user) ───────────
//
// import useSocket        from "../hooks/useSocket";
// import { useSelector }  from "react-redux";       // or however you get user
//
// const { user } = useSelector((state) => state.auth);
//
// useSocket({
//   userId: user?._id,
//   onNotification: (n) => {
//     toast.info(n.message);           // show a toast
//     refetchNotifications();          // re-fetch bell count
//   },
// });
