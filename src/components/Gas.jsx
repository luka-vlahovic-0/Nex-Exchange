import { useState } from "react";
import { chains } from "../chains";
import { coins } from "../coins";
import SettingsMenu from "./SettingsMenu";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GasHeader from "./Gas Components/GasHeader";
import GasFromSection from "./Gas Components/GasFromSection";
import GasToSection from "./Gas Components/GasToSection";
import GasAmountSection from "./Gas Components/GasAmountSection";
import GasButton from "./Gas Components/GasButton";
import GasTokenSelection from "./Gas Components/GasTokenSelection";

export default function Gas() {
  const [isFromTokenMenuOpen, setIsFromTokenMenuOpen] = useState(false);
  const [isToTokenMenuOpen, setIsToTokenMenuOpen] = useState(false);
  const [selectedFromChain, setSelectedFromChain] = useState(chains[0]);
  const [selectedToChain, setSelectedToChain] = useState(chains[1]);
  const [selectedFromCoin, setSelectedFromCoin] = useState(
    getNativeCoin(chains[0].name)
  );
  const [selectedToCoin, setSelectedToCoin] = useState(
    getNativeCoin(chains[1].name)
  );
  const [amount, setAmount] = useState("");
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  function getNativeCoin(chainName) {
    switch (chainName) {
      case "Ethereum":
      case "Arbitrum One":
      case "Optimism":
      case "Base":
      case "Linea":
      case "Scroll":
        return coins.find((coin) => coin.name === "ETH");
      case "Polygon":
        return coins.find((coin) => coin.name === "Matic");
      case "Fantom":
        return coins.find((coin) => coin.name === "FTM");
      case "BSC":
        return coins.find((coin) => coin.name === "BNB");
      default:
        return null;
    }
  }

  const gasToast = () => {
    toast.success(
      `Gas has been successfully transferred to ${selectedToChain.name}. 🚀`,
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

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const regex = /^\d*\.?\d*$/;

    if (value === "" || regex.test(value)) {
      setAmount(value);
    }
  };

  const toggleFromTokenMenu = () => {
    setIsFromTokenMenuOpen(!isFromTokenMenuOpen);
    setIsToTokenMenuOpen(false);
  };

  const toggleToTokenMenu = () => {
    setIsToTokenMenuOpen(!isToTokenMenuOpen);
    setIsFromTokenMenuOpen(false);
  };

  const selectFromChain = (chain) => {
    if (chain.name === selectedToChain.name) {
      toast.error(
        "You cannot select the same chain for both 'From' and 'To'.",
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
      return;
    }
    setSelectedFromChain(chain);
    setSelectedFromCoin(getNativeCoin(chain.name));
  };

  const selectToChain = (chain) => {
    if (chain.name === selectedFromChain.name) {
      toast.error(
        "You cannot select the same chain for both 'From' and 'To'.",
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
      return;
    }
    setSelectedToChain(chain);
    setSelectedToCoin(getNativeCoin(chain.name));
    setIsToTokenMenuOpen(false);
  };

  const selectFromCoin = (coin) => {
    setSelectedFromCoin(coin);
    setIsFromTokenMenuOpen(false);
  };

  const isChainDisabled = (chain) => {
    return chain.name === selectedFromChain.name;
  };

  const getChainClassName = (chain) => {
    if (isChainDisabled(chain)) {
      return "flex items-center justify-center cursor-pointer p-2 rounded-full bg-red-500 cursor-not-allowed";
    }
    return `flex items-center justify-center cursor-pointer p-2 rounded-full ${
      selectedToChain.name === chain.name ? "bg-[#6e4ca1]" : "bg-[#272343]"
    }`;
  };

  return (
    <div className="bg-[#0a0729] p-6 rounded-xl mt-14 w-96 h-[465px]">
      {!isSettingsMenuOpen ? (
        <>
          
          <GasHeader
            isFromTokenMenuOpen={isFromTokenMenuOpen}
            isToTokenMenuOpen={isToTokenMenuOpen}
            setIsSettingsMenuOpen={setIsSettingsMenuOpen}
            toggleFromTokenMenu={toggleFromTokenMenu}
            toggleToTokenMenu={toggleToTokenMenu}
          />

          {!isFromTokenMenuOpen && !isToTokenMenuOpen ? (
            <>
              
              <GasFromSection
                selectedFromChain={selectedFromChain}
                selectedFromCoin={selectedFromCoin}
                toggleFromTokenMenu={toggleFromTokenMenu}
              />
              
              <GasToSection
                selectedToChain={selectedToChain}
                selectedToCoin={selectedToCoin}
                toggleToTokenMenu={toggleToTokenMenu}
              />

             
              <GasAmountSection
                amount={amount}
                handleAmountChange={handleAmountChange}
                selectedFromCoin={selectedFromCoin}
              />

             
              <GasButton gasToast={gasToast} />
            </>
          ) : (
            <div className="bg-[#0a0729] p-4 rounded-3xl">
              
              <GasTokenSelection
                chains={chains}
                coins={coins}
                getChainClassName={getChainClassName}
                isChainDisabled={isChainDisabled}
                isFromTokenMenuOpen={isFromTokenMenuOpen}
                selectFromChain={selectFromChain}
                selectFromCoin={selectFromCoin}
                selectToChain={selectToChain}
                selectedFromChain={selectedFromChain}
              />
            </div>
          )}
        </>
      ) : (
        <SettingsMenu onClose={() => setIsSettingsMenuOpen(false)} />
      )}
    </div>
  );
}
