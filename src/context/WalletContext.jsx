/* eslint-disable react/prop-types */
import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider } from "ethers";
import { addChainParams } from "../lib/chains";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const hasWallet = typeof window !== "undefined" && !!window.ethereum;

  useEffect(() => {
    if (!hasWallet) return;
    const eth = window.ethereum;

    // Restore an existing session without prompting
    eth.request({ method: "eth_accounts" })
      .then((accounts) => accounts?.[0] && setAddress(accounts[0]))
      .catch(() => {});
    eth.request({ method: "eth_chainId" })
      .then((id) => setChainId(Number(id)))
      .catch(() => {});

    const onAccountsChanged = (accounts) => setAddress(accounts?.[0] ?? null);
    const onChainChanged = (id) => setChainId(Number(id));
    eth.on("accountsChanged", onAccountsChanged);
    eth.on("chainChanged", onChainChanged);
    return () => {
      eth.removeListener("accountsChanged", onAccountsChanged);
      eth.removeListener("chainChanged", onChainChanged);
    };
  }, [hasWallet]);

  const connect = useCallback(async () => {
    if (!hasWallet) {
      window.open("https://metamask.io/download/", "_blank", "noopener");
      return;
    }
    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAddress(accounts?.[0] ?? null);
      const id = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(Number(id));
    } finally {
      setConnecting(false);
    }
  }, [hasWallet]);

  const disconnect = useCallback(() => {
    setAddress(null);
    // Best effort — newer MetaMask versions support revoking permissions
    window.ethereum
      ?.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      })
      .catch(() => {});
  }, []);

  const switchChain = useCallback(
    async (chain) => {
      if (!hasWallet) return;
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chain.hexChainId }],
        });
      } catch (error) {
        // 4902 = chain not added to the wallet yet
        if (error?.code === 4902 || error?.data?.originalError?.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [addChainParams(chain)],
          });
        } else {
          throw error;
        }
      }
    },
    [hasWallet]
  );

  const getSigner = useCallback(async () => {
    const provider = new BrowserProvider(window.ethereum);
    return provider.getSigner();
  }, []);

  const value = useMemo(
    () => ({ address, chainId, connecting, hasWallet, connect, disconnect, switchChain, getSigner }),
    [address, chainId, connecting, hasWallet, connect, disconnect, switchChain, getSigner]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export const useWallet = () => useContext(WalletContext);
