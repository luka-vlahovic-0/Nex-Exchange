// Testnet chain registry. Sepolia is the hub chain (swaps happen there);
// the L2 testnets are bridge destinations via their official native bridges.

export const SEPOLIA_CHAIN_ID = 11155111;

export const chains = {
  sepolia: {
    key: "sepolia",
    chainId: 11155111,
    hexChainId: "0xaa36a7",
    name: "Sepolia",
    shortName: "Sepolia",
    layer: "Ethereum L1 Testnet",
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    explorer: "https://sepolia.etherscan.io",
    nativeSymbol: "ETH",
    img: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg",
    accent: "#627eea",
    weth: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
  },
  baseSepolia: {
    key: "baseSepolia",
    chainId: 84532,
    hexChainId: "0x14a34",
    name: "Base Sepolia",
    shortName: "Base",
    layer: "OP Stack L2 Testnet",
    rpcUrl: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
    nativeSymbol: "ETH",
    img: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/base.svg",
    accent: "#0052ff",
    weth: "0x4200000000000000000000000000000000000006",
    // Official Base Sepolia L1StandardBridge (lives on Sepolia)
    bridge: { type: "opstack", address: "0xfd0Bf71F60660E2f608ed56e1659C450eB113120" },
    eta: "~2 min",
  },
  opSepolia: {
    key: "opSepolia",
    chainId: 11155420,
    hexChainId: "0xaa37dc",
    name: "OP Sepolia",
    shortName: "Optimism",
    layer: "OP Stack L2 Testnet",
    rpcUrl: "https://sepolia.optimism.io",
    explorer: "https://sepolia-optimism.etherscan.io",
    nativeSymbol: "ETH",
    img: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/optimism.svg",
    accent: "#ff0420",
    weth: "0x4200000000000000000000000000000000000006",
    bridge: { type: "opstack", address: "0xFBb0621E0B23b5478B630BD55a5f21f67730B0F1" },
    eta: "~2 min",
  },
  arbSepolia: {
    key: "arbSepolia",
    chainId: 421614,
    hexChainId: "0x66eee",
    name: "Arbitrum Sepolia",
    shortName: "Arbitrum",
    layer: "Arbitrum Rollup Testnet",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    explorer: "https://sepolia.arbiscan.io",
    nativeSymbol: "ETH",
    img: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/arbitrum.svg",
    accent: "#12aaff",
    weth: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",
    // Official Arbitrum Sepolia delayed inbox (lives on Sepolia)
    bridge: { type: "arbitrum", address: "0xaAe29B0366299461418F5324a79Afc425BE5ae21" },
    eta: "~10 min",
  },
};

export const allTestnetChains = Object.values(chains);

export const bridgeDestinations = [chains.baseSepolia, chains.opSepolia, chains.arbSepolia];

export const chainById = (chainId) =>
  Object.values(chains).find((c) => c.chainId === Number(chainId));

export const addChainParams = (chain) => ({
  chainId: chain.hexChainId,
  chainName: chain.name,
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: [chain.rpcUrl],
  blockExplorerUrls: [chain.explorer],
});
