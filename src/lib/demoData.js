// Demo-mode universe: a full multi-chain experience with simulated
// execution but LIVE market prices from CoinGecko for realistic quotes.

const TW = "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains";
const LIFI = "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains";

export const demoChains = [
  { key: "ethereum", name: "Ethereum", img: `${LIFI}/ethereum.svg` },
  { key: "base", name: "Base", img: `${LIFI}/base.svg` },
  { key: "arbitrum", name: "Arbitrum One", img: `${LIFI}/arbitrum.svg` },
  { key: "optimism", name: "Optimism", img: `${LIFI}/optimism.svg` },
  { key: "polygon", name: "Polygon", img: `${LIFI}/polygon.svg` },
  { key: "bsc", name: "BNB Chain", img: `${LIFI}/bsc.svg` },
  { key: "avalanche", name: "Avalanche", img: `${LIFI}/avalanche.svg` },
  { key: "zksync", name: "zkSync Era", img: `${LIFI}/zksync.svg` },
  { key: "linea", name: "Linea", img: `${LIFI}/linea.svg` },
  { key: "scroll", name: "Scroll", img: `${LIFI}/scroll.png` },
  { key: "fantom", name: "Fantom", img: `${LIFI}/fantom.svg` },
  { key: "gnosis", name: "Gnosis", img: `${LIFI}/gnosis.svg` },
];

export const demoCoins = [
  { symbol: "ETH", name: "Ethereum", coingeckoId: "ethereum", starter: 2.5, img: `${TW}/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png` },
  { symbol: "WBTC", name: "Wrapped Bitcoin", coingeckoId: "wrapped-bitcoin", starter: 0.08, img: `${TW}/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png` },
  { symbol: "SOL", name: "Solana", coingeckoId: "solana", starter: 25, img: `${TW}/solana/info/logo.png` },
  { symbol: "USDC", name: "USD Coin", coingeckoId: "usd-coin", starter: 5000, img: `${TW}/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png` },
  { symbol: "USDT", name: "Tether", coingeckoId: "tether", starter: 2500, img: `${TW}/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png` },
  { symbol: "DAI", name: "Dai Stablecoin", coingeckoId: "dai", starter: 1500, img: `${TW}/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png` },
  { symbol: "BNB", name: "BNB", coingeckoId: "binancecoin", starter: 6, img: "https://assets.coingecko.com/coins/images/825/small/binance-coin-logo.png" },
  { symbol: "POL", name: "Polygon", coingeckoId: "matic-network", starter: 1800, img: `${TW}/ethereum/assets/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0/logo.png` },
  { symbol: "AVAX", name: "Avalanche", coingeckoId: "avalanche-2", starter: 30, img: `${TW}/avalanchec/info/logo.png` },
  { symbol: "LINK", name: "Chainlink", coingeckoId: "chainlink", starter: 90, img: `${TW}/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png` },
  { symbol: "UNI", name: "Uniswap", coingeckoId: "uniswap", starter: 120, img: `${TW}/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png` },
  { symbol: "AAVE", name: "Aave", coingeckoId: "aave", starter: 5, img: `${TW}/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png` },
  { symbol: "ARB", name: "Arbitrum", coingeckoId: "arbitrum", starter: 900, img: `${TW}/arbitrum/assets/0x912CE59144191C1204E64559FE8253a0e49E6548/logo.png` },
  { symbol: "OP", name: "Optimism", coingeckoId: "optimism", starter: 500, img: `${TW}/optimism/assets/0x4200000000000000000000000000000000000042/logo.png` },
  { symbol: "DOGE", name: "Dogecoin", coingeckoId: "dogecoin", starter: 4000, img: `${TW}/doge/info/logo.png` },
  { symbol: "SHIB", name: "Shiba Inu", coingeckoId: "shiba-inu", starter: 25000000, img: `${TW}/ethereum/assets/0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE/logo.png` },
  { symbol: "PEPE", name: "Pepe", coingeckoId: "pepe", starter: 60000000, img: `${TW}/ethereum/assets/0x6982508145454Ce325dDbE47a25d4ec3d2311933/logo.png` },
  { symbol: "LDO", name: "Lido DAO", coingeckoId: "lido-dao", starter: 300, img: `${TW}/ethereum/assets/0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32/logo.png` },
  { symbol: "MKR", name: "Maker", coingeckoId: "maker", starter: 0.4, img: `${TW}/ethereum/assets/0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2/logo.png` },
  { symbol: "CRV", name: "Curve DAO", coingeckoId: "curve-dao-token", starter: 1200, img: `${TW}/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png` },
  { symbol: "SNX", name: "Synthetix", coingeckoId: "havven", starter: 400, img: `${TW}/ethereum/assets/0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F/logo.png` },
  { symbol: "GRT", name: "The Graph", coingeckoId: "the-graph", starter: 3500, img: `${TW}/ethereum/assets/0xc944E90C64B2c07662A292be6244BDf05Cda44a7/logo.png` },
  { symbol: "CAKE", name: "PancakeSwap", coingeckoId: "pancakeswap-token", starter: 150, img: `${TW}/smartchain/assets/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82/logo.png` },
  { symbol: "RENDER", name: "Render", coingeckoId: "render-token", starter: 80, img: `${TW}/ethereum/assets/0x6De037ef9aD2725EB40118Bb1702EBb27e4Aeb24/logo.png` },
  { symbol: "FTM", name: "Fantom", coingeckoId: "fantom", starter: 1000, img: `${TW}/ethereum/assets/0x4E15361FD6b4BB609Fa63C81A2be19d873717870/logo.png` },
];

export const demoCoinBySymbol = (symbol) => demoCoins.find((c) => c.symbol === symbol);

export const DEMO_SWAP_FEE = 0.003; // 0.3%, matches a typical AMM

export const starterBalances = Object.fromEntries(
  demoCoins.map((coin) => [coin.symbol, coin.starter])
);
