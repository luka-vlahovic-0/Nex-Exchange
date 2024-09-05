/* eslint-disable react/prop-types */
import { Settings } from "lucide-react";

export default function BuyHeader({ setIsSettingsMenuOpen }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <header className="text-white text-xl font-semibold">Buy Crypto</header>
        <button
          className="text-gray-400 hover:text-white"
          onClick={() => setIsSettingsMenuOpen(true)}
        >
          <Settings size={25} />
        </button>
      </div>
    </div>
  );
}
