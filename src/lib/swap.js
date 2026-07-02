import { Contract, JsonRpcProvider, MaxUint256 } from "ethers";
import { chains } from "./chains";
import {
  WETH_ADDRESS,
  SWAP_ROUTER_02,
  QUOTER_V2,
  ROUTER_ADDRESS_THIS,
  isWrapPair,
} from "./tokens";
import { ERC20_ABI, WETH_ABI, QUOTER_V2_ABI, SWAP_ROUTER_02_ABI } from "./abis";

const FEE_TIERS = [500, 3000, 10000];

export const readProvider = (chainKey = "sepolia") =>
  new JsonRpcProvider(chains[chainKey].rpcUrl, chains[chainKey].chainId, {
    staticNetwork: true,
  });

// Uniswap pools only know WETH; native ETH legs are handled by the router.
const poolAddress = (token) => token.address ?? WETH_ADDRESS;

/**
 * Quote fromToken -> toToken for amountIn (bigint).
 * Returns { amountOut, fee, route } — fee is null for 1:1 wraps.
 * Throws if no pool has liquidity for the pair.
 */
export async function quoteSwap(fromToken, toToken, amountIn) {
  if (isWrapPair(fromToken, toToken)) {
    return { amountOut: amountIn, fee: null, route: fromToken.symbol === "ETH" ? "Wrap" : "Unwrap" };
  }

  const quoter = new Contract(QUOTER_V2, QUOTER_V2_ABI, readProvider());
  const quotes = await Promise.allSettled(
    FEE_TIERS.map((fee) =>
      quoter.quoteExactInputSingle.staticCall({
        tokenIn: poolAddress(fromToken),
        tokenOut: poolAddress(toToken),
        amountIn,
        fee,
        sqrtPriceLimitX96: 0n,
      })
    )
  );

  let best = null;
  quotes.forEach((result, i) => {
    if (result.status !== "fulfilled") return;
    const amountOut = result.value[0];
    if (!best || amountOut > best.amountOut) {
      best = { amountOut, fee: FEE_TIERS[i], route: "Uniswap V3" };
    }
  });

  if (!best || best.amountOut === 0n) {
    throw new Error("No liquidity available for this pair on Sepolia.");
  }
  return best;
}

export async function getAllowance(token, owner) {
  if (!token.address) return MaxUint256; // native ETH needs no approval
  const erc20 = new Contract(token.address, ERC20_ABI, readProvider());
  return erc20.allowance(owner, SWAP_ROUTER_02);
}

export async function approveRouter(signer, token, amount) {
  const erc20 = new Contract(token.address, ERC20_ABI, signer);
  return erc20.approve(SWAP_ROUTER_02, amount);
}

/**
 * Execute the swap. Assumes allowance is already in place for ERC20 inputs.
 * quote: result of quoteSwap. slippageBps: e.g. 50 = 0.5%.
 * Returns the tx response.
 */
export async function executeSwap({ signer, fromToken, toToken, amountIn, quote, slippageBps = 50 }) {
  // 1:1 wraps via WETH9 itself
  if (isWrapPair(fromToken, toToken)) {
    const weth = new Contract(WETH_ADDRESS, WETH_ABI, signer);
    return fromToken.symbol === "ETH"
      ? weth.deposit({ value: amountIn })
      : weth.withdraw(amountIn);
  }

  const router = new Contract(SWAP_ROUTER_02, SWAP_ROUTER_02_ABI, signer);
  const recipient = await signer.getAddress();
  const minOut = (quote.amountOut * BigInt(10000 - slippageBps)) / 10000n;
  const value = fromToken.address ? 0n : amountIn;

  // ERC20 -> native ETH: swap to WETH held by the router, then unwrap to the user
  if (!toToken.address) {
    const swapData = router.interface.encodeFunctionData("exactInputSingle", [
      {
        tokenIn: fromToken.address,
        tokenOut: WETH_ADDRESS,
        fee: quote.fee,
        recipient: ROUTER_ADDRESS_THIS,
        amountIn,
        amountOutMinimum: minOut,
        sqrtPriceLimitX96: 0n,
      },
    ]);
    const unwrapData = router.interface.encodeFunctionData("unwrapWETH9", [minOut, recipient]);
    return router.multicall([swapData, unwrapData]);
  }

  return router.exactInputSingle(
    {
      tokenIn: poolAddress(fromToken),
      tokenOut: toToken.address,
      fee: quote.fee,
      recipient,
      amountIn,
      amountOutMinimum: minOut,
      sqrtPriceLimitX96: 0n,
    },
    { value }
  );
}
