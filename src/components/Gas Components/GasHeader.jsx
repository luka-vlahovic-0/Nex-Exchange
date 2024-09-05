/* eslint-disable react/prop-types */
import { ArrowLeft, Settings } from "lucide-react";

export default function GasHeader({ isFromTokenMenuOpen, isToTokenMenuOpen, setIsSettingsMenuOpen, toggleFromTokenMenu, toggleToTokenMenu }) {
  return (
    <div className="flex justify-between items-center mb-6">
      {!isFromTokenMenuOpen && !isToTokenMenuOpen ? (
        <>
          <header className="text-white text-xl font-semibold">
            Gas Transfer
          </header>
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => setIsSettingsMenuOpen(true)}
          >
            <Settings size={25} />
          </button>
        </>
      ) : (
        <>
          <button
            className="text-gray-400 hover:text-white"
            onClick={
              isFromTokenMenuOpen ? toggleFromTokenMenu : toggleToTokenMenu
            }
          >
            <ArrowLeft size={25} />
          </button>
          <header className="text-white text-xl font-semibold">
            {isFromTokenMenuOpen
              ? "Select From Chain and Coin"
              : "Select To Chain"}
          </header>
          <div className="w-6"></div>
        </>
      )}
    </div>
  );
}
