/* eslint-disable react/prop-types */
import { ToastContainer } from "react-toastify";

export default function SwapButton({ swapToast, buttonText }) {
  return (
    <div className="text-center">
      <button
        onClick={swapToast}
        className="bg-[#6e4ca1] hover:bg-[#5e3d8f] duration-200 text-white font-bold text-lg py-2 px-4 rounded-full w-36"
      >
        {buttonText}
      </button>
      <ToastContainer />
    </div>
  );
}
