/* eslint-disable react/prop-types */
import { ToastContainer } from "react-toastify";

export default function GasButton({ gasToast }) {
  return (
    <div className="text-center">
      <button
        onClick={gasToast}
        className="bg-[#6e4ca1] hover:bg-[#5e3d8f] duration-200 text-white text-lg font-bold py-2 px-4 rounded-full w-36"
      >
        Send Gas
      </button>
      <ToastContainer />
    </div>
  );
}
