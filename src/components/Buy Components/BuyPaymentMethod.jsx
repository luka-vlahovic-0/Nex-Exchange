/* eslint-disable react/prop-types */
import { ChevronDown, ChevronUp, X } from "lucide-react";

export default function BuyPaymentMethod({paymentMethods, togglePaymentMethodMenu, selectedPaymentMethod, isPaymentMethodMenuOpen, setSelectedPaymentMethod, setIsPaymentMethodMenuOpen }) {
  return (
    <div
      className="bg-[#272343] p-4 rounded-2xl mb-4"
      onClick={togglePaymentMethodMenu}
    >
      <div className="flex justify-between items-center">
        <div className="text-white">
          <span className="block text-sm">Pay with</span>
          <div className="flex items-center mt-2">
            <img
              src={selectedPaymentMethod.img}
              alt={selectedPaymentMethod.name}
              className="w-8 h-8 mr-2 rounded-full"
            />
            <span className="mr-6">{selectedPaymentMethod.name}</span>
          </div>
        </div>
        {isPaymentMethodMenuOpen ? (
          <ChevronUp className="text-white" />
        ) : (
          <ChevronDown className="text-white" />
        )}
      </div>
      {isPaymentMethodMenuOpen && (
        <div className="absolute inset-0 z-10 bg-[#0a0729] rounded-3xl p-4 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white text-xl font-semibold ml-14">
              Select Payment Method
            </span>
            <button
              className="text-gray-400 hover:text-white"
              onClick={togglePaymentMethodMenu}
            >
              <X size={25} />
            </button>
          </div>
          <div className="scrollable-menu h-96 p-2 overflow-y-auto">
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className={`flex items-center my-2 p-2 cursor-pointer rounded-lg hover:bg-[#595577] ${
                  selectedPaymentMethod.name === method.name
                    ? "bg-[#6e4ca1]"
                    : "bg-[#272343]"
                }`}
                onClick={() => {
                  setSelectedPaymentMethod(method);
                  setIsPaymentMethodMenuOpen(false);
                }}
              >
                <img
                  src={method.img}
                  alt={method.name}
                  className="w-6 h-6 mr-2 rounded-full"
                />
                <span className="text-white">{method.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
