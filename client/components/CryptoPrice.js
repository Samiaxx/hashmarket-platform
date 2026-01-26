import { useEffect, useState } from 'react';

export default function CryptoPrice({ usdPrice }) {
  const [rates, setRates] = useState({ eth: 0, btc: 0, sol: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch live rates from CoinGecko
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,solana&vs_currencies=usd')
      .then(res => res.json())
      .then(data => {
        setRates({
          eth: data.ethereum.usd,
          btc: data.bitcoin.usd,
          sol: data.solana.usd
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Crypto rate fetch failed", err);
        setLoading(false);
      });
  }, []);

  if (loading || !rates.eth) return <span className="text-[10px] text-gray-500 animate-pulse">Loading crypto rates...</span>;

  // Conversions
  const ethValue = (usdPrice / rates.eth).toFixed(4);
  const btcValue = (usdPrice / rates.btc).toFixed(5);
  
  return (
    <div className="flex flex-col items-end">
      {/* Primary Crypto Display (ETH) */}
      <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded border border-emerald-500/30">
        <span className="text-[10px]">♦</span>
        <span>{ethValue} ETH</span>
      </div>
      
      {/* Secondary Display (BTC) */}
      <div className="text-[10px] text-gray-500 font-mono mt-1 flex gap-1">
        <span>≈ {btcValue} ₿</span>
      </div>
    </div>
  );
}