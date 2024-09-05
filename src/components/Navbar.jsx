import { useState } from "react";
import { ArrowLeftRight, Fuel, Wallet, AlignJustify } from "lucide-react";
import nexraImg from "../assets/nexra.png";
import { MetaMaskButton } from "@metamask/sdk-react-ui";

export default function Navbar({ setShowGas, setShowSwap, setShowBuy }) {
  const [activeButton, setActiveButton] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleButtonClick = (button) => {
    setActiveButton(button);
    setShowDropdown(false);

    if (button === "gas") {
      setShowGas(true);
      setShowSwap(false);
      setShowBuy(false);
    } else if (button === "exchange") {
      setShowGas(false);
      setShowSwap(true);
      setShowBuy(false);
    } else if (button === "buy") {
      setShowGas(false);
      setShowSwap(false);
      setShowBuy(true);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full flex justify-between items-center p-1 bg-transparent z-10 sm:mb-60">
      {/* Logo */}
      <div className="flex items-center flex-1">
        <img src={nexraImg} alt="Website logo" className="h-[70px] w-[100px]" />
      </div>

      {/* Buttons (hidden on medium and smaller screens) */}
      <div className="hidden md:flex justify-center">
        <div className="bg-white/10 p-2 rounded-full flex space-x-16">
          <button
            onClick={() => handleButtonClick("exchange")}
            className={`flex text-lg items-center font-semibold text-white px-4 py-2 bg-transparent hover:bg-white/10 rounded-full transition-colors duration-200 ${
              activeButton === "exchange"
                ? "bg-white/20"
                : "bg-transparent hover:bg-white/10"
            }`}
          >
            <ArrowLeftRight className="mr-2" />
            Exchange
          </button>
          <button
            onClick={() => handleButtonClick("gas")}
            className={`flex text-lg items-center font-semibold text-white px-4 py-2 bg-transparent hover:bg-white/10 rounded-full transition-colors duration-200 ${
              activeButton === "gas"
                ? "bg-white/20"
                : "bg-transparent hover:bg-white/10"
            }`}
          >
            <Fuel className="mr-2" />
            Gas
          </button>
          <button
            onClick={() => handleButtonClick("buy")}
            className={`flex text-lg items-center font-semibold text-white px-4 py-2 bg-transparent hover:bg-white/10 rounded-full transition-colors duration-200 ${
              activeButton === "buy"
                ? "bg-white/20"
                : "bg-transparent hover:bg-white/10"
            }`}
          >
            <Wallet className="mr-2" />
            Buy
          </button>
        </div>
      </div>

      {/* Connect Wallet and Dropdown Menu */}
      <div className="flex items-center flex-1 justify-end pr-4 pb-2 text-lg">
        <MetaMaskButton
          removeDefaultStyles={true}
          buttonStyle={{
            backgroundColor: "#603f91",
            color: "#FFFFFF",
            padding: "0.5rem 1rem",
            borderRadius: "9999px",
            whiteSpace: "nowrap", // Prevents text from wrapping to a new line
          }}
          text="Connect Wallet"
          icon="no-icon"
          textAlign="middle"
        />

        {/* AlignJustify Icon for Dropdown Menu (visible on small screens) */}
        <button
          className="ml-4 md:hidden"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <AlignJustify className="text-white" />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-[20px] top-[83px] bg-[#0a0729] p-4 rounded-3xl flex flex-col space-y-4">
            <button
              onClick={() => handleButtonClick("exchange")}
              className="flex text-lg items-center font-semibold text-white bg-transparent hover:bg-white/10 rounded-full transition-colors duration-200"
            >
              <ArrowLeftRight className="mr-2" />
              Exchange
            </button>
            <button
              onClick={() => handleButtonClick("gas")}
              className="flex text-lg items-center font-semibold text-white bg-transparent hover:bg-white/10 rounded-full transition-colors duration-200"
            >
              <Fuel className="mr-2" />
              Gas
            </button>
            <button
              onClick={() => handleButtonClick("buy")}
              className="flex text-lg items-center font-semibold text-white bg-transparent hover:bg-white/10 rounded-full transition-colors duration-200"
            >
              <Wallet className="mr-2" />
              Buy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
