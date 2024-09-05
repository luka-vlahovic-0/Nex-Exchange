/* eslint-disable react/prop-types */
export default function SwapTokenSelection2({
  selectCoin,
  selectedToCoin,
  selectedFromCoin,
  chains,
  isFromTokenMenuOpen,
  selectedFromChain,
  selectedToChain,
  selectChain,
  coins,
  isCoinAvailable,
}) {
  return (
    <div className="bg-[#0a0729] rounded-3xl">
      {/* Token Selection Menu */}
      <div className="space-y-4">
        {/* Chain Icons Grid */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {chains.slice(0, 5).map((chain, index) => (
            <div
              key={index}
              className={`flex items-center justify-center cursor-pointer p-2 rounded-full ${
                (isFromTokenMenuOpen ? selectedFromChain : selectedToChain)
                  .name === chain.name
                  ? "bg-[#6e4ca1]"
                  : "bg-[#272343]"
              }`}
              onClick={() =>
                selectChain(chain, isFromTokenMenuOpen ? "from" : "to")
              }
            >
              <img
                src={chain.img}
                alt={chain.name}
                className="w-8 h-8 rounded-full"
              />
            </div>
          ))}
        </div>

        {/* Chains with "+19" Indicator */}
        <div className="grid grid-cols-5 gap-2">
          {chains.slice(5, 9).map((chain, index) => (
            <div
              key={index}
              className={`flex items-center justify-center cursor-pointer p-2 rounded-full ${
                (isFromTokenMenuOpen ? selectedFromChain : selectedToChain)
                  .name === chain.name
                  ? "bg-[#6e4ca1]"
                  : "bg-[#272343]"
              }`}
              onClick={() =>
                selectChain(chain, isFromTokenMenuOpen ? "from" : "to")
              }
            >
              <img
                src={chain.img}
                alt={chain.name}
                className="w-8 h-8 rounded-full"
              />
            </div>
          ))}
          <div
            className="flex items-center justify-center cursor-pointer p-2 rounded-full bg-[#272343]"
            onClick={() => console.log("Show more chains")}
          >
            <span className="text-white">+19</span>
          </div>
        </div>

        {/* Scrollable Coin List */}
        <div className="scrollable-menu h-60 overflow-y-auto bg-[#0a0729] rounded-xl p-2">
          <div className="flex flex-col space-y-2">
            {coins.map((coin, index) => (
              <div
                key={index}
                className={`flex items-center p-2 cursor-pointer rounded-full ${
                  isCoinAvailable(coin)
                    ? (isFromTokenMenuOpen ? selectedFromCoin : selectedToCoin)
                        .name === coin.name
                      ? "bg-[#6e4ca1]"
                      : "bg-[#272343]"
                    : "bg-red-500 cursor-not-allowed"
                }`}
                onClick={() =>
                  isCoinAvailable(coin) &&
                  selectCoin(coin, isFromTokenMenuOpen ? "from" : "to")
                }
              >
                <img
                  src={coin.img}
                  alt={coin.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="text-white">{coin.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
