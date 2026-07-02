import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { WalletProvider } from "./context/WalletContext";
import { ToastProvider } from "./context/ToastContext";
import { TxProvider } from "./context/TxContext";
import { ModeProvider } from "./context/ModeContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ModeProvider>
      <WalletProvider>
        <ToastProvider>
          <TxProvider>
            <App />
          </TxProvider>
        </ToastProvider>
      </WalletProvider>
    </ModeProvider>
  </StrictMode>
);
