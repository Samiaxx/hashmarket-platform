import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CryptoTracker() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch live data from CoinGecko (Free Public API)
    const fetchData = async () => {
      try {
        const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano,ripple&vs_currencies=usd&include_24hr_change=true');
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Crypto API Error", err);
        setLoading(false);
      }
    };

    fetchData();
    
    // 2. Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const coins = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'solana', name: 'Solana', symbol: 'SOL' },
  ];

  if (loading) return null;

  return (
    <div className="w-full bg-slate-900 text-white py-6 mb-8 rounded-xl shadow-2xl overflow-hidden border border-slate-800">
      <div className="px-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Live Market Analysis</h3>
          <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded-full">● Live Feed</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coins.map((coin) => {
            const coinData = data[coin.id];
            if (!coinData) return null; // Skip if data missing
            
            const price = coinData.usd;
            const change = coinData.usd_24h_change;
            const isUp = change >= 0;

            return (
              <div key={coin.id} className="bg-slate-800/50 p-4 rounded-lg flex justify-between items-center border border-slate-700 hover:border-slate-600 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{coin.name}</span>
                    <span className="text-xs text-slate-400 font-mono">{coin.symbol}</span>
                  </div>
                  <div className="text-2xl font-mono mt-1 font-medium">${price.toLocaleString()}</div>
                </div>
                <div className={`text-right ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  <div className="text-sm font-bold flex items-center justify-end gap-1">
                    <span>{isUp ? '▲' : '▼'}</span>
                    {Math.abs(change).toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase mt-1">24h Change</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}