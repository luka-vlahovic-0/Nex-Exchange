import { useEffect, useState } from "react";
import { demoCoins } from "../lib/demoData";
import { tokens } from "../lib/tokens";

const IDS = [
  ...new Set([
    ...demoCoins.map((c) => c.coingeckoId),
    ...tokens.map((t) => t.coingeckoId),
    "bitcoin",
  ]),
].join(",");

const PRICE_URL = `https://api.coingecko.com/api/v3/simple/price?ids=${IDS}&vs_currencies=usd,eur,gbp`;
const REFRESH_MS = 60000;

let cache = null;

/** Live mainnet prices — powers demo-mode quotes and USD estimates. */
export function usePrices() {
  const [prices, setPrices] = useState(cache);

  useEffect(() => {
    let cancelled = false;
    const fetchPrices = async () => {
      try {
        const res = await fetch(PRICE_URL);
        if (!res.ok) return;
        const data = await res.json();
        cache = data;
        if (!cancelled) setPrices(data);
      } catch {
        /* offline — USD estimates just hide */
      }
    };
    fetchPrices();
    const id = setInterval(fetchPrices, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return prices;
}

export const usdPrice = (prices, coingeckoId) => prices?.[coingeckoId]?.usd ?? null;
