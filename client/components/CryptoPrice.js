import { useEffect, useState } from "react";

export default function CryptoPrice({ usdPrice }) {
  const [ethRate, setEthRate] = useState(null);

  useEffect(() => {
    // Fetch ETH price from CoinGecko API
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
      .then((res) => res.json())
      .then((data) => setEthRate(data.ethereum.usd))
      .catch((err) => console.error("Error fetching crypto price:", err));
  }, []);

  if (!ethRate || !usdPrice) return <span className="text-xs text-gray-600">...</span>;

  const ethValue = (parseFloat(usdPrice) / ethRate).toFixed(4);

  return (
    <div className="text-right">
      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Est. Crypto</span>
      <div className="text-sm font-mono font-bold text-emerald-400">
        Ξ {ethValue}
      </div>
    </div>
  );
}