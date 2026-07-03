import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import App from "./App.jsx";
import "./index.css";
import { wagmiConfig } from "./lib/wagmi";
import { ToastProvider } from "./context/ToastContext";
import { TxProvider } from "./context/TxContext";
import { ModeProvider } from "./context/ModeContext";

const queryClient = new QueryClient();

const theme = darkTheme({
  accentColor: "#8b5cf6",
  accentColorForeground: "white",
  borderRadius: "large",
  overlayBlur: "small",
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={theme} modalSize="compact">
          <ModeProvider>
            <ToastProvider>
              <TxProvider>
                <App />
              </TxProvider>
            </ToastProvider>
          </ModeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
