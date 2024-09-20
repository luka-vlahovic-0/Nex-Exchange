import Navbar from "./components/Navbar";
import Swap from "./components/Swap";
import Gas from "./components/Gas";
import Buy from "./components/Buy"; 
import { useState } from "react";
import "./styles.css";
import Footer from "./components/Footer";

function App() {
  const [showSwap, setShowSwap] = useState(true);
  const [showGas, setShowGas] = useState(false);
  const [showBuy, setShowBuy] = useState(false); 

  return (
    <div className="App min-h-screen bg-[#0a0729] flex flex-col items-center">
      <Navbar setShowSwap={setShowSwap} setShowGas={setShowGas} setShowBuy={setShowBuy} />
      <div className="flex-grow flex items-center justify-center">
        {showSwap && <Swap />}
        {showGas && <Gas />}
        {showBuy && <Buy />} 
      </div>
      <Footer />
    </div>
  );
}

export default App;
