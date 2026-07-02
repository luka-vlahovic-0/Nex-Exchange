import { Github, Linkedin, Droplets } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full pb-24 pt-10 md:pb-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center">
        <a
          href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium text-cyan-300/80 transition-colors hover:text-cyan-200"
        >
          <Droplets size={13} />
          Need Sepolia ETH? Grab some from a faucet
        </a>
        <div className="flex items-center gap-4">
          <p className="text-xs text-white/40">© 2026 · Built by Luka Vlahovic</p>
          <span className="h-3 w-px bg-white/15" />
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/luka-vlahovic-0/Nex-Exchange"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-white/40 transition-colors hover:text-white"
            >
              <Github size={16} />
            </a>
            <a
              href="https://www.linkedin.com/in/luka-vlahovic-657162281/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-white/40 transition-colors hover:text-white"
            >
              <Linkedin size={16} />
            </a>
          </div>
        </div>
        <p className="max-w-md text-[10px] leading-relaxed text-white/25">
          Testnet mode runs real on-chain transactions on Sepolia and its L2 testnets via Uniswap
          V3, the official native bridges and Across Protocol. Demo mode simulates execution with
          live market prices. No real funds are ever involved.
        </p>
      </div>
    </footer>
  );
}
