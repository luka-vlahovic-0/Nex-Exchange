import { Contract } from "ethers";
import { L1_STANDARD_BRIDGE_ABI, ARB_INBOX_ABI, SPOKE_POOL_ABI } from "./abis";

const ACROSS_API = "https://testnet.across.to/api";

/**
 * Route rules:
 *  - Sepolia -> L2: the chain's official native bridge (canonical, always works)
 *  - L2 -> L2 and L2 -> Sepolia: Across Protocol testnet (relayer-filled, ~10s)
 */
export const bridgeRoute = (fromChain) =>
  fromChain.key === "sepolia" ? "native" : "across";

/**
 * Bridge native ETH from Sepolia to an L2 testnet using the chain's
 * official native bridge. Funds arrive automatically (no claim step).
 */
export async function bridgeEthNative({ signer, destination, amount }) {
  const { type, address } = destination.bridge;

  if (type === "opstack") {
    const bridge = new Contract(address, L1_STANDARD_BRIDGE_ABI, signer);
    return bridge.bridgeETH(200000, "0x", { value: amount });
  }

  if (type === "arbitrum") {
    const inbox = new Contract(address, ARB_INBOX_ABI, signer);
    return inbox.depositEth({ value: amount });
  }

  throw new Error(`Unknown bridge type: ${type}`);
}

/**
 * Quote an Across testnet transfer. Throws with a friendly message when the
 * route is outside the relayers' current limits.
 * Returns everything depositV3 needs plus display info.
 */
export async function getAcrossQuote({ fromChain, toChain, amount }) {
  const params = new URLSearchParams({
    inputToken: fromChain.weth,
    outputToken: toChain.weth,
    originChainId: String(fromChain.chainId),
    destinationChainId: String(toChain.chainId),
    amount: amount.toString(),
  });
  const res = await fetch(`${ACROSS_API}/suggested-fees?${params}`);
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(friendlyAcrossError(data));
    err.code = data?.code;
    err.limits = data?.message?.match(/[\d.]+/g);
    throw err;
  }

  return {
    outputAmount: BigInt(data.outputAmount),
    totalFee: BigInt(data.totalRelayFee.total),
    spokePool: data.spokePoolAddress,
    timestamp: Number(data.timestamp),
    fillDeadline: Number(data.fillDeadline),
    exclusiveRelayer: data.exclusiveRelayer,
    exclusivityDeadline: Number(data.exclusivityDeadline ?? 0),
    estimatedFillTimeSec: Number(data.estimatedFillTimeSec ?? 60),
    maxDeposit: BigInt(data.limits?.maxDeposit ?? 0),
    minDeposit: BigInt(data.limits?.minDeposit ?? 0),
  };
}

function friendlyAcrossError(data) {
  if (data?.code === "AMOUNT_TOO_HIGH") {
    const max = data.message?.match(/([\d.]+) WETH/)?.[1];
    return max
      ? `Amount exceeds current relayer liquidity — max right now is ${Number(max).toFixed(5)} ETH.`
      : "Amount exceeds current relayer liquidity. Try a smaller amount.";
  }
  if (data?.code === "AMOUNT_TOO_LOW") {
    return "Amount is below the minimum for this route. Try a larger amount.";
  }
  return data?.message || "This route is unavailable right now.";
}

/**
 * Execute an Across testnet ETH transfer. Sends native ETH (the SpokePool
 * wraps it); the recipient receives native ETH on the destination chain.
 */
export async function bridgeEthAcross({ signer, fromChain, toChain, amount, quote, recipient }) {
  const spokePool = new Contract(quote.spokePool, SPOKE_POOL_ABI, signer);
  return spokePool.depositV3(
    recipient,
    recipient,
    fromChain.weth,
    toChain.weth,
    amount,
    quote.outputAmount,
    toChain.chainId,
    quote.exclusiveRelayer,
    quote.timestamp,
    quote.fillDeadline,
    quote.exclusivityDeadline,
    "0x",
    { value: amount }
  );
}
