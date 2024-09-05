/* eslint-disable react/prop-types */
import { X } from "lucide-react";

export default function BuyFiatMenu({ isCurrencyMenuOpen, toggleCurrencyMenu, fiatCurrency, selectedCurrency, setSelectedCurrency, setIsCurrencyMenuOpen }) {
  return (
    <>
      {isCurrencyMenuOpen && (
        <div className="absolute inset-0 z-10 bg-[#0a0729] rounded-3xl p-4 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white text-xl font-semibold ml-20">
              Select fiat currency
            </span>
            <button
              className="text-gray-400 hover:text-white"
              onClick={toggleCurrencyMenu}
            >
              <X size={25} />
            </button>
          </div>
          <div className="scrollable-menu h-96 p-2 overflow-y-auto">
            {fiatCurrency.map((currency) => (
              <div
                key={currency.name}
                className={`flex items-center my-2 p-2 cursor-pointer rounded-lg hover:bg-[#595577] ${
                  selectedCurrency.name === currency.name
                    ? "bg-[#6e4ca1]"
                    : "bg-[#272343]"
                }`}
                onClick={() => {
                  setSelectedCurrency(currency);
                  setIsCurrencyMenuOpen(false);
                }}
              >
                <img
                  src={currency.img}
                  alt={currency.name}
                  className="w-8 h-8 mr-2 rounded-full"
                />
                <div>
                  <span className="text-white">{currency.fullName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
