/* eslint-disable react/prop-types */
export default function SwapTokenSelection({
  toggleFromTokenMenu,
  selectedFromCoin,
  selectedFromChain,
  toggleToTokenMenu,
  selectedToCoin,
  selectedToChain,
}) {
  return (
    <>
      <div
        className="bg-[#272343] p-4 rounded-2xl mb-4 cursor-pointer"
        onClick={toggleFromTokenMenu}
      >
        <div className="flex justify-between items-center">
          <div className="text-white">
            <span className="block text-sm">From</span>
            <div className="flex items-center">
              <div className="relative">
                <img
                  src={selectedFromCoin.img}
                  alt={selectedFromCoin.name}
                  className="w-8 h-8 mr-2 mt-2 rounded-full"
                />
                <img
                  src={selectedFromChain.img}
                  alt={selectedFromChain.name}
                  className="w-4 h-4 absolute bottom-0 right-0 rounded-full border-2 border-[#0a0729]"
                />
              </div>
              <div>
                <span>{selectedFromCoin.name}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {selectedFromChain.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="bg-[#272343] p-4 rounded-2xl mb-4 cursor-pointer"
        onClick={toggleToTokenMenu}
      >
        <div className="flex justify-between items-center">
          <div className="text-white">
            <span className="block text-sm">To</span>
            <div className="flex items-center">
              <div className="relative">
                <img
                  src={selectedToCoin.img}
                  alt={selectedToCoin.name}
                  className="w-8 h-8 mr-2 mt-2 rounded-full"
                />
                <img
                  src={selectedToChain.img}
                  alt={selectedToChain.name}
                  className="w-4 h-4 absolute bottom-0 right-0 rounded-full border-2 border-[#0a0729]"
                />
              </div>
              <div>
                <span>{selectedToCoin.name}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {selectedToChain.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
