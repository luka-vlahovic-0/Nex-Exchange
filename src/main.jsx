import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { MetaMaskUIProvider } from "@metamask/sdk-react-ui";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MetaMaskUIProvider
      sdkOptions={{
        dappMetadata: {
          name: "Nexra",
          url: window.location.href,
        },
        infuraAPIKey: import.meta.env.VITE_INFURA_API_KEY,
      }}
    >
      <App />
    </MetaMaskUIProvider>
  </StrictMode>
);
