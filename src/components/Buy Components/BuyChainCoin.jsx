/* eslint-disable react/prop-types */
import { ChevronDown, ChevronUp, X } from "lucide-react";

export default function BuyChainCoin({ toggleChainMenu, selectedChain, isChainMenuOpen, chainMenuRef, selectedCoin, chains, handleChainClick, handleCoinClick, coins }) {
  return (
    <div
      className="bg-[#272343] p-4 rounded-2xl mb-4"
      onClick={toggleChainMenu}
    >
      <div className="flex justify-between items-center">
        <div className="text-white">
          <span className="block text-sm">Buy </span>
          <div className="flex items-center">
            <img
              src={selectedCoin.img}
              alt={selectedCoin.name}
              className="w-8 h-8 mr-2 mt-2 rounded-full"
            />
            <span className="mt-2">{selectedCoin.name}</span>
            <span className="text-xs text-gray-400 ml-2 mt-2">
              on {selectedChain.name}
            </span>
          </div>
        </div>
        {isChainMenuOpen ? (
          <ChevronUp className="text-white" />
        ) : (
          <ChevronDown className="text-white" />
        )}
      </div>
      {isChainMenuOpen && (
        <div
          ref={chainMenuRef}
          className="absolute inset-0 z-10 bg-[#0a0729] rounded-3xl p-4 shadow-lg"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-white text-xl font-semibold ml-16">
              Select Chain and Coin
            </span>
            <button
              className="text-gray-400 hover:text-white"
              onClick={toggleChainMenu}
            >
              <X size={25} />
            </button>
          </div>
          <div className="scrollable-menu h-96 p-2 overflow-y-auto">
            {/* Chains section */}
            <div className="mb-6">
              <span className="text-gray-400 text-sm block mb-2">
                Select Chain
              </span>
              <div className="grid grid-cols-2 gap-2">
                {chains.map((chain) => (
                  <div
                    key={chain.name}
                    className={`flex cursor-pointer p-2 rounded-lg hover:bg-[#595577] ${
                      selectedChain.name === chain.name
                        ? "bg-[#6e4ca1]"
                        : "bg-[#272343]"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChainClick(chain);
                    }}
                  >
                    <img
                      src={chain.img}
                      alt={chain.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <p className="text-white ml-2">{chain.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Coins section */}
            <div>
              <span className="text-gray-400 text-sm block mb-2">
                Select Coin
              </span>
              <div className="grid grid-cols-3 gap-2">
                {coins.map((coin) => (
                  <div
                    key={coin.name}
                    className={`flex items-center p-2 cursor-pointer rounded-lg hover:bg-[#595577] ${
                      selectedCoin.name === coin.name
                        ? "bg-[#6e4ca1]"
                        : "bg-[#272343]"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCoinClick(coin);
                    }}
                  >
                    <img
                      src={coin.img}
                      alt={coin.name}
                      className="w-6 h-6 mr-2 rounded-full"
                    />
                    <span className="text-white">{coin.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
