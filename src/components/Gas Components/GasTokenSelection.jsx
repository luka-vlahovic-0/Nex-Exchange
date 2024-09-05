/* eslint-disable react/prop-types */
export default function GasTokenSelection({ isFromTokenMenuOpen, chains, selectedFromChain, selectFromChain, selectFromCoin, getChainClassName, isChainDisabled, selectToChain, coins }) {
  return (
    <div className="space-y-4">
      {isFromTokenMenuOpen ? (
        <>
          {/* Chain Icons Grid */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {chains.slice(0, 5).map((chain, index) => (
              <div
                key={index}
                className={`flex items-center justify-center cursor-pointer p-2 rounded-full ${
                  selectedFromChain.name === chain.name
                    ? "bg-[#6e4ca1]"
                    : "bg-[#272343]"
                }`}
                onClick={() => selectFromChain(chain)}
              >
                <img
                  src={chain.img}
                  alt={chain.name}
                  className="w-8 h-8 rounded-full"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {chains.slice(5, 9).map((chain, index) => (
              <div
                key={index}
                className={`flex items-center justify-center cursor-pointer p-2 rounded-full ${
                  selectedFromChain.name === chain.name
                    ? "bg-[#6e4ca1]"
                    : "bg-[#272343]"
                }`}
                onClick={() => selectFromChain(chain)}
              >
                <img
                  src={chain.img}
                  alt={chain.name}
                  className="w-8 h-8 rounded-full"
                />
              </div>
            ))}

            <div className="flex items-center justify-center cursor-pointer p-2 rounded-full bg-[#272343]">
              <span className="text-white">+19</span>
            </div>
          </div>

          {/* Coins List */}
          <div className="scrollable-menu p-2 space-y-2 overflow-auto max-h-40">
            {coins.map((coin, index) => (
              <div
                key={index}
                className="flex items-center justify-between cursor-pointer p-2 bg-[#272343] rounded-lg"
                onClick={() => selectFromCoin(coin)}
              >
                <div className="flex items-center">
                  <img
                    src={coin.img}
                    alt={coin.name}
                    className="w-6 h-6 mr-2 rounded-full"
                  />
                  <span className="text-white">{coin.name}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Chain Icons Grid 2 */}
          <div className="grid grid-cols-5 gap-2 mt-20">
            {chains.slice(0, 5).map((chain, index) => (
              <div
                key={index}
                className={getChainClassName(chain)}
                onClick={() => !isChainDisabled(chain) && selectToChain(chain)}
              >
                <img
                  src={chain.img}
                  alt={chain.name}
                  className="w-8 h-8 rounded-full"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2 mt-20">
            {chains.slice(5, 9).map((chain, index) => (
              <div
                key={index}
                className={getChainClassName(chain)}
                onClick={() => !isChainDisabled(chain) && selectToChain(chain)}
              >
                <img
                  src={chain.img}
                  alt={chain.name}
                  className="w-8 h-8 rounded-full"
                />
              </div>
            ))}

            <div className="flex items-center justify-center cursor-pointer p-2 rounded-full bg-[#272343]">
              <span className="text-white">+19</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
