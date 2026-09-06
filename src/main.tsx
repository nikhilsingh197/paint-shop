import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.tsx";
import { CartProvider } from "./context/CartContext.tsx"; // Import the CartProvider

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        {" "}
        {/* Add this wrapper */}
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);
