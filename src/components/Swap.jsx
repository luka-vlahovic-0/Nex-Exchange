import { useState } from "react";
import { chains } from "../chains";
import { coins } from "../coins";
import SettingsMenu from "./SettingsMenu";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SwapHeader from "./Swap Components/SwapHeader";
import SwapTokenSelection from "./Swap Components/SwapTokenSelection";
import SwapAmountSection from "./Swap Components/SwapAmountSection";
import SwapButton from "./Swap Components/SwapButton";
import SwapTokenSelection2 from "./Swap Components/SwapTokenSelection2";

export default function Swap() {
  const [isFromTokenMenuOpen, setIsFromTokenMenuOpen] = useState(false);
  const [isToTokenMenuOpen, setIsToTokenMenuOpen] = useState(false);
  const [selectedFromChain, setSelectedFromChain] = useState(chains[0]);
  const [selectedToChain, setSelectedToChain] = useState(chains[1]);
  const [selectedFromCoin, setSelectedFromCoin] = useState(coins[0]);
  const [selectedToCoin, setSelectedToCoin] = useState(coins[1]);
  const [amount, setAmount] = useState("");
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  const swapToast = () => {
    toast.success(
      `${buttonText} successful. Your ${selectedToCoin.name} will arrive shortly. ✅`,
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      }
    );
  };

  const toggleFromTokenMenu = () => {
    setIsFromTokenMenuOpen(!isFromTokenMenuOpen);
    setIsToTokenMenuOpen(false);
  };

  const toggleToTokenMenu = () => {
    setIsToTokenMenuOpen(!isToTokenMenuOpen);
    setIsFromTokenMenuOpen(false);
  };

  const selectChain = (chain, type) => {
    if (type === "from") {
      setSelectedFromChain(chain);
    } else {
      setSelectedToChain(chain);
    }
  };

  const selectCoin = (coin, type) => {
    if (type === "from") {
      setSelectedFromCoin(coin);
      setIsFromTokenMenuOpen(false);
    } else {
      setSelectedToCoin(coin);
      setIsToTokenMenuOpen(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const regex = /^\d*\.?\d*$/;

    if (value === "" || regex.test(value)) {
      setAmount(value);
    }
  };

  const isSameChain = selectedFromChain.name === selectedToChain.name;
  const buttonText = isSameChain ? "Swap" : "Bridge";

  const isCoinAvailable = (coin) => {
    return !(
      selectedFromChain.name === selectedToChain.name &&
      selectedFromCoin.name === coin.name
    );
  };

  return (
    <div className="bg-[#0a0729] p-6 rounded-xl mx-auto w-96 mt-14 h-[465px]">
      {!isSettingsMenuOpen ? (
        <>
          {/* Header */}
          <SwapHeader
            isFromTokenMenuOpen={isFromTokenMenuOpen}
            isToTokenMenuOpen={isToTokenMenuOpen}
            setIsSettingsMenuOpen={setIsSettingsMenuOpen}
            toggleFromTokenMenu={toggleFromTokenMenu}
            toggleToTokenMenu={toggleToTokenMenu}
          />

          {!isFromTokenMenuOpen && !isToTokenMenuOpen ? (
            <>
              {/* Token Selection */}
              <SwapTokenSelection
                selectedFromChain={selectedFromChain}
                selectedFromCoin={selectedFromCoin}
                selectedToChain={selectedToChain}
                selectedToCoin={selectedToCoin}
                toggleFromTokenMenu={toggleFromTokenMenu}
                toggleToTokenMenu={toggleToTokenMenu}
              />

              {/* Amount Input */}
              <SwapAmountSection
                amount={amount}
                handleAmountChange={handleAmountChange}
                selectedFromCoin={selectedFromCoin}
              />

              {/* Swap or Bridge Button */}
              <SwapButton buttonText={buttonText} swapToast={swapToast} />
            </>
          ) : (
            <SwapTokenSelection2
              chains={chains}
              coins={coins}
              isCoinAvailable={isCoinAvailable}
              isFromTokenMenuOpen={isFromTokenMenuOpen}
              selectChain={selectChain}
              selectCoin={selectCoin}
              selectedFromChain={selectedFromChain}
              selectedFromCoin={selectedFromCoin}
              selectedToChain={selectedToChain}
              selectedToCoin={selectedToCoin}
            />
          )}
        </>
      ) : (
        <SettingsMenu onClose={() => setIsSettingsMenuOpen(false)} />
      )}
    </div>
  );
}
