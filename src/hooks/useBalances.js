import { useCallback, useEffect, useState } from "react";
import { Contract } from "ethers";
import { tokens } from "../lib/tokens";
import { chains } from "../lib/chains";
import { ERC20_ABI } from "../lib/abis";
import { readProvider } from "../lib/swap";

const POLL_MS = 15000;

/** Sepolia token balances for the swap panel: { ETH: bigint, WETH: bigint, USDC: bigint } */
export function useTokenBalances(address) {
  const [balances, setBalances] = useState({});

  const refresh = useCallback(async () => {
    if (!address) {
      setBalances({});
      return;
    }
    const provider = readProvider("sepolia");
    const entries = await Promise.all(
      tokens.map(async (token) => {
        try {
          const balance = token.address
            ? await new Contract(token.address, ERC20_ABI, provider).balanceOf(address)
            : await provider.getBalance(address);
          return [token.symbol, balance];
        } catch {
          return [token.symbol, null];
        }
      })
    );
    setBalances(Object.fromEntries(entries));
  }, [address]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { balances, refresh };
}

/** Native ETH balance on each chain: { sepolia: bigint, baseSepolia: bigint, ... } */
export function useNativeBalances(address) {
  const [balances, setBalances] = useState({});

  const refresh = useCallback(async () => {
    if (!address) {
      setBalances({});
      return;
    }
    const entries = await Promise.all(
      Object.values(chains).map(async (chain) => {
        try {
          return [chain.key, await readProvider(chain.key).getBalance(address)];
        } catch {
          return [chain.key, null];
        }
      })
    );
    setBalances(Object.fromEntries(entries));
  }, [address]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { balances, refresh };
}
