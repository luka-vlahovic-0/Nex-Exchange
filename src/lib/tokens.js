// Sepolia tokens with real, verified contract addresses.
// ETH <-> WETH swaps use WETH9 deposit/withdraw (always 1:1).
// Everything else routes through Uniswap V3 on Sepolia.

export const WETH_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
export const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

export const SWAP_ROUTER_02 = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E";
export const QUOTER_V2 = "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3";
// SwapRouter02 Constants.ADDRESS_THIS — used as recipient for unwrap multicalls
export const ROUTER_ADDRESS_THIS = "0x0000000000000000000000000000000000000002";

export const tokens = [
  {
    symbol: "ETH",
    name: "Ether",
    address: null, // native
    decimals: 18,
    coingeckoId: "ethereum",
    img: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: WETH_ADDRESS,
    decimals: 18,
    coingeckoId: "ethereum",
    img: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  },
  {
    symbol: "USDC",
    name: "USD Coin (Circle testnet)",
    address: USDC_ADDRESS,
    decimals: 6,
    coingeckoId: "usd-coin",
    img: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  },
  {
    symbol: "LINK",
    name: "Chainlink (testnet)",
    address: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    decimals: 18,
    coingeckoId: "chainlink",
    img: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png",
  },
  {
    symbol: "DAI",
    name: "DAI (Aave testnet)",
    address: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
    decimals: 18,
    coingeckoId: "dai",
    img: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
  },
  {
    symbol: "EURC",
    name: "Euro Coin (Circle testnet)",
    address: "0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4",
    decimals: 6,
    coingeckoId: "euro-coin",
    img: "https://assets.coingecko.com/coins/images/26045/small/euro.png",
  },
];

export const tokenBySymbol = (symbol) => tokens.find((t) => t.symbol === symbol);

export const isWrapPair = (a, b) =>
  (a.symbol === "ETH" && b.symbol === "WETH") ||
  (a.symbol === "WETH" && b.symbol === "ETH");
