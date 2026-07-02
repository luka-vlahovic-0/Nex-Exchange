import { formatUnits } from "ethers";

export const shortenAddress = (address) =>
  address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";

// Human-friendly token amount: trims to sensible precision without
// scientific notation or long decimal tails.
export function formatAmount(value, decimals = 18, maxSignificant = 6) {
  if (value === null || value === undefined) return "0";
  const num = typeof value === "bigint" ? Number(formatUnits(value, decimals)) : Number(value);
  if (!isFinite(num)) return "0";
  if (num === 0) return "0";
  if (num < 0.000001) return "<0.000001";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1000) return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const magnitude = Math.floor(Math.log10(Math.abs(num)));
  const decimalsToShow = Math.max(0, Math.min(8, maxSignificant - 1 - magnitude));
  return num.toLocaleString("en-US", { maximumFractionDigits: decimalsToShow });
}

export function formatUsd(num) {
  if (num === null || num === undefined || !isFinite(num)) return null;
  if (num === 0) return "$0.00";
  if (num < 0.01) return "<$0.01";
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export const isValidAmountInput = (value) => value === "" || /^\d*\.?\d*$/.test(value);

export function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
