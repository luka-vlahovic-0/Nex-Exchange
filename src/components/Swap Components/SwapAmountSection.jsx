/* eslint-disable react/prop-types */
export default function SwapAmountSection({
  selectedFromCoin,
  amount,
  handleAmountChange,
}) {
  return (
    <div className="bg-[#272343] p-4 rounded-2xl mb-6">
      <span className="block text-sm text-white mb-2">Send</span>
      <div className="flex items-center">
        <img
          src={selectedFromCoin.img}
          alt={selectedFromCoin.name}
          className="w-8 h-8 mr-2 rounded-full"
        />
        <input
          type="text"
          inputMode="decimal"
          className="bg-transparent text-white text-lg outline-none w-full"
          placeholder="0"
          value={amount}
          onChange={handleAmountChange}
        />
        <span className="ml-auto text-gray-400">$0.00</span>
      </div>
    </div>
  );
}
