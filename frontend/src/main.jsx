import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles/global.css";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthProvider>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#18181b",
            color: "#fafafa",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            padding: "12px 16px",
            fontSize: "14.5px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          },
          success: {
            iconTheme: { primary: "#f97316", secondary: "#18181b" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#18181b" },
          },
        }}
      />
    </AuthProvider>
  </Provider>,
);
