import { useState, useRef, useEffect } from "react";
import { fiatCurrency } from "../fiatCurrency";
import { paymentMethods } from "../paymentMethods";
import { chains } from "../chains";
import { coins } from "../coins";
import SettingsMenu from "./SettingsMenu";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BuyHeader from "./Buy Components/BuyHeader";
import BuyCurrencyAmount from "./Buy Components/BuyCurrencyAmount";
import BuyFiatMenu from "./Buy Components/BuyFiatMenu";
import BuyChainCoin from "./Buy Components/BuyChainCoin";
import BuyPaymentMethod from "./Buy Components/BuyPaymentMethod";
import BuyButton from "./Buy Components/BuyButton";

export default function Buy() {
  const [amount, setAmount] = useState("100");
  const [selectedCurrency, setSelectedCurrency] = useState(fiatCurrency[1]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    paymentMethods[0]
  );
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const [isPaymentMethodMenuOpen, setIsPaymentMethodMenuOpen] = useState(false);
  const [isChainMenuOpen, setIsChainMenuOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState(chains[0]);
  const [selectedCoin, setSelectedCoin] = useState(coins[0]);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  const chainMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chainMenuRef.current &&
        !chainMenuRef.current.contains(event.target)
      ) {
        setIsChainMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const buyToast = () => {
    toast.success(
      "Your transaction was a success! Enjoy your new crypto assets. 💰",
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

  const toggleCurrencyMenu = () => {
    setIsCurrencyMenuOpen(!isCurrencyMenuOpen);
    setIsPaymentMethodMenuOpen(false);
    setIsChainMenuOpen(false);
  };

  const togglePaymentMethodMenu = () => {
    setIsPaymentMethodMenuOpen(!isPaymentMethodMenuOpen);
    setIsCurrencyMenuOpen(false);
    setIsChainMenuOpen(false);
  };

  const toggleChainMenu = () => {
    setIsChainMenuOpen(!isChainMenuOpen);
    setIsCurrencyMenuOpen(false);
    setIsPaymentMethodMenuOpen(false);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleChainClick = (chain) => {
    setSelectedChain(chain);
    setIsChainMenuOpen(true);
  };

  const handleCoinClick = (coin) => {
    setSelectedCoin(coin);
    setIsChainMenuOpen(false);
  };

  return (
    <div className="bg-[#0a0729] p-6 rounded-xl w-96 h-[465px] mt-14 mx-auto relative">
      {!isSettingsMenuOpen ? (
        <>
          <BuyHeader setIsSettingsMenuOpen={setIsSettingsMenuOpen} />

          <BuyCurrencyAmount
            amount={amount}
            handleAmountChange={handleAmountChange}
            isCurrencyMenuOpen={isCurrencyMenuOpen}
            selectedCurrency={selectedCurrency}
            toggleCurrencyMenu={toggleCurrencyMenu}
          />

          <BuyFiatMenu
            fiatCurrency={fiatCurrency}
            isCurrencyMenuOpen={isCurrencyMenuOpen}
            selectedCurrency={selectedCurrency}
            setIsCurrencyMenuOpen={setIsCurrencyMenuOpen}
            setSelectedCurrency={setSelectedCurrency}
            toggleCurrencyMenu={toggleCurrencyMenu}
          />

          <BuyChainCoin
            chainMenuRef={chainMenuRef}
            chains={chains}
            coins={coins}
            handleChainClick={handleChainClick}
            handleCoinClick={handleCoinClick}
            isChainMenuOpen={isChainMenuOpen}
            selectedChain={selectedChain}
            selectedCoin={selectedCoin}
            toggleChainMenu={toggleChainMenu}
          />

          <BuyPaymentMethod
            isPaymentMethodMenuOpen={isPaymentMethodMenuOpen}
            paymentMethods={paymentMethods}
            selectedPaymentMethod={selectedPaymentMethod}
            setIsPaymentMethodMenuOpen={setIsPaymentMethodMenuOpen}
            setSelectedPaymentMethod={setSelectedPaymentMethod}
            togglePaymentMethodMenu={togglePaymentMethodMenu}
          />

          <BuyButton buyToast={buyToast} selectedCoin={selectedCoin} />
        </>
      ) : (
        <SettingsMenu onClose={() => setIsSettingsMenuOpen(false)} />
      )}
    </div>
  );
}
