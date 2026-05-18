import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      {/*
        ✅ FIX: future flags silence the two React Router v6 → v7 warnings:
          1. v7_startTransition  — wraps state updates in React.startTransition
          2. v7_relativeSplatPath — fixes relative route resolution in splat routes
        These are opt-in now; they become the default in React Router v7.
      */}
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
