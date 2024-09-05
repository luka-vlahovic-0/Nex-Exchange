/* eslint-disable react/prop-types */
import { ToastContainer } from 'react-toastify'

export default function BuyButton({ buyToast, selectedCoin }) {
  return (
    <div className="text-center">
            <button
              onClick={buyToast}
              className="bg-[#6e4ca1] hover:bg-[#5e3d8f] mt-2 duration-200 text-white font-bold text-lg py-2 px-4 rounded-full w-36"
            >
              {`Buy ${selectedCoin.name}`}
            </button>
            <ToastContainer />
          </div>
  )
}
