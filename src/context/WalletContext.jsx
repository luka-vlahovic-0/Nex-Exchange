// Thin adapter over wagmi + RainbowKit so the rest of the app keeps its
// single useWallet() API. Connection UX (wallet list, WalletConnect, account
// management) is handled by RainbowKit; contract calls stay on ethers via a
// viem wallet-client -> ethers signer bridge.

import { useCallback } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useAccount, useDisconnect, useSwitchChain, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export function useWallet() {
  const { address, chainId, isConnecting } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const connect = useCallback(() => openConnectModal?.(), [openConnectModal]);

  const switchChain = useCallback(
    (chain) => switchChainAsync({ chainId: chain.chainId }),
    [switchChainAsync]
  );

  const getSigner = useCallback(async () => {
    if (!walletClient) throw new Error("Wallet not connected");
    const { account, chain, transport } = walletClient;
    const provider = new BrowserProvider(transport, {
      chainId: chain.id,
      name: chain.name,
    });
    return new JsonRpcSigner(provider, account.address);
  }, [walletClient]);

  return {
    address,
    chainId,
    connecting: isConnecting,
    hasWallet: true,
    connect,
    disconnect,
    switchChain,
    getSigner,
  };
}
