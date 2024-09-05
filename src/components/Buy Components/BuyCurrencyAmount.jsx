/* eslint-disable react/prop-types */
import { ChevronDown, X } from "lucide-react";

export default function BuyCurrencyAmount({ toggleCurrencyMenu, selectedCurrency, amount, handleAmountChange, isCurrencyMenuOpen }) {
  return (
    <div
      className="bg-[#272343] p-4 rounded-2xl mb-4"
      onClick={toggleCurrencyMenu}
    >
      <div className="flex justify-between items-center">
        <div className="text-white">
          <span className="block text-sm">Pay with</span>
          <div className="flex items-center mt-2">
            <img
              src={selectedCurrency.img}
              alt={selectedCurrency.name}
              className="w-8 h-8 mr-2 rounded-full"
            />
            <span className="mr-6">{selectedCurrency.name}</span>
            <div className="flex items-center rounded-full bg-[#3c3661]">
              <input
                inputMode="decimal"
                type="text"
                value={amount}
                onChange={handleAmountChange}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent text-white text-xl w-20 outline-none ml-2"
              />
            </div>
          </div>
        </div>
        <button
          className="text-gray-400 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            toggleCurrencyMenu();
          }}
        >
          {isCurrencyMenuOpen ? (
            <X size={25} />
          ) : (
            <ChevronDown className="text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
