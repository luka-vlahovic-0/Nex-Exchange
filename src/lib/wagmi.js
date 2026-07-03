import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia, baseSepolia, optimismSepolia, arbitrumSepolia } from "wagmi/chains";
import { chains } from "./chains";

// WalletConnect Cloud project id (public identifier)
const projectId = "e13bdbd6cc8f6a15b9660c944185c8a7";

export const wagmiConfig = getDefaultConfig({
  appName: "Nex Exchange",
  projectId,
  chains: [sepolia, baseSepolia, optimismSepolia, arbitrumSepolia],
  transports: {
    [sepolia.id]: http(chains.sepolia.rpcUrl),
    [baseSepolia.id]: http(chains.baseSepolia.rpcUrl),
    [optimismSepolia.id]: http(chains.opSepolia.rpcUrl),
    [arbitrumSepolia.id]: http(chains.arbSepolia.rpcUrl),
  },
});
