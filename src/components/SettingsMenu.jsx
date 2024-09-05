/* eslint-disable react/prop-types */
import { ArrowLeft } from "lucide-react";

export default function SettingsMenu({ onClose }) {
  return (
    <div className="h-[428px] w-[336px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button className="text-gray-400 hover:text-white" onClick={onClose}>
          <ArrowLeft size={25} />
        </button>
        <header className="text-white text-xl font-semibold">Settings</header>
        <div className="w-6"></div>
      </div>

      {/* Settings Options */}
      <div className="space-y-4">
        <div className="bg-[#272343] p-4 rounded-2xl flex justify-between items-center hover:bg-[#38304f] transition-colors">
          <span className="text-white">Route priority</span>
          <span className="text-gray-400">Best Return</span>
        </div>
        <div className="bg-[#272343] p-4 rounded-2xl flex justify-between items-center hover:bg-[#38304f] transition-colors">
          <span className="text-white">Gas price</span>
          <span className="text-gray-400">Normal</span>
        </div>
        <div className="bg-[#272343] p-4 rounded-2xl flex justify-between items-center hover:bg-[#38304f] transition-colors">
          <span className="text-white">Max. slippage</span>
          <span className="text-gray-400">0.5%</span>
        </div>
        <div className="bg-[#272343] p-4 rounded-2xl flex justify-between items-center hover:bg-[#38304f] transition-colors">
          <span className="text-white">Bridges</span>
          <span className="text-gray-400">19/19</span>
        </div>
        <div className="bg-[#272343] p-4 rounded-2xl flex justify-between items-center hover:bg-[#38304f] transition-colors">
          <span className="text-white">Exchanges</span>
          <span className="text-gray-400">34/34</span>
        </div>
      </div>
    </div>
  );
}
