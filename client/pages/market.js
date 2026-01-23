import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CryptoTracker from '../components/CryptoTracker';
import { useRouter } from 'next/router';

// Simulated Exchange Rates (In a real app, these come from an Oracle/API)
const COIN_RATES = {
  ETH: { price: 3000, symbol: 'ETH', network: 'Ethereum', gas: 0.0021, icon: '⟠' },
  BTC: { price: 90000, symbol: 'BTC', network: 'Bitcoin', gas: 0.0004, icon: '₿' },
  SOL: { price: 140, symbol: 'SOL', network: 'Solana', gas: 0.015, icon: '◎' },
  USDT: { price: 1, symbol: 'USDT', network: 'Tether (ERC20)', gas: 5.00, icon: '₮' }
};

export default function Market() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); 
  
  // Web3 Checkout States
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('confirm'); // 'select-coin', 'confirm', 'processing', 'success'
  const [selectedCoin, setSelectedCoin] = useState('ETH'); // Default to ETH
  
  const router = useRouter();

  useEffect(() => { 
    fetchListings(); 
  }, []);

  useEffect(() => {
    let result = listings;
    if (categoryFilter !== 'all') result = result.filter(item => item.category === categoryFilter);
    if (searchTerm) {
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredListings(result);
  }, [listings, categoryFilter, searchTerm]);

  const fetchListings = async () => {
    try {
      const res = await axios.get('https://hashmarket-platform.vercel.app/api/listings');
      setListings(res.data);
      setFilteredListings(res.data);
    } catch (err) { console.error(err); }
  };

  const initiateBuy = (item) => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    
    // Web3 Gatekeeping
    if (!localStorage.getItem('wallet')) {
      alert("Please connect your Crypto Wallet in the Navbar to purchase.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSelectedItem(item);
    setCheckoutStep('select-coin'); // Start at coin selection
    setShowModal(true);
  };

  const processCryptoPayment = async () => {
    setCheckoutStep('processing'); // Show blockchain spinner

    // Simulate Blockchain Confirmation (3 seconds)
    setTimeout(async () => {
      const token = localStorage.getItem('token');
      try {
        await axios.post('https://hashmarket-platform.vercel.app/api/orders', 
          { listingId: selectedItem._id }, 
          { headers: { 'x-auth-token': token } }
        );
        setCheckoutStep('success'); 
        fetchListings(); 
      } catch (err) { 
        alert("Transaction Failed. " + (err.response?.data?.msg || ''));
        setCheckoutStep('confirm');
      }
    }, 3000);
  };

  // Helper to calculate price in selected coin
  const getCryptoPrice = () => {
    if (!selectedItem) return 0;
    const rate = COIN_RATES[selectedCoin].price;
    return (selectedItem.price / rate).toFixed(6);
  };

  // Helper to get total including gas
  const getTotalCrypto = () => {
    const base = parseFloat(getCryptoPrice());
    const gas = COIN_RATES[selectedCoin].gas;
    // For USDT (stablecoin), gas is usually separate (ETH), but for demo we add it simply
    if (selectedCoin === 'USDT') return (base + gas).toFixed(2);
    return (base + gas).toFixed(6);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      {/* HERO SECTION */}
      <div className="bg-slate-900 pt-12 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="mb-12"><CryptoTracker /></div>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              Decentralized <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Crypto Marketplace</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              The premier Web3 platform for physical and digital assets. Pay securely with your preferred chain.
              <span className="text-orange-400 font-bold ml-2">Multi-Chain Supported.</span>
            </p>
            <div className="relative max-w-xl mx-auto transform hover:scale-105 transition duration-300">
              <input type="text" placeholder="Search for Mining Rigs, NFTs, Hardware..." className="w-full py-5 pl-14 pr-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white/20 transition shadow-2xl text-lg" onChange={(e) => setSearchTerm(e.target.value)} />
              <svg className="w-6 h-6 text-slate-400 absolute left-5 top-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* MARKET CONTENT */}
      <div className="container mx-auto px-6 md:px-12 -mt-20 relative z-20 pb-20">
        <div className="flex justify-center gap-4 mb-12">
          {['all', 'physical', 'digital'].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-8 py-3 rounded-full font-bold text-sm transition shadow-lg capitalize transform hover:-translate-y-1 ${categoryFilter === cat ? 'bg-orange-500 text-white shadow-orange-500/30' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
              {cat === 'all' ? 'All Assets' : cat === 'physical' ? '📦 Physical' : '💻 Digital'}
            </button>
          ))}
        </div>
        
        {filteredListings.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm max-w-2xl mx-auto">
            <span className="text-6xl block mb-4">🔍</span>
            <h3 className="text-2xl font-bold text-slate-800">No results found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.map(item => (
              <div key={item._id} className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-orange-900/10 transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col h-full">
                <Link href={`/product/${item._id}`}>
                  <div className="cursor-pointer h-64 flex items-center justify-center relative overflow-hidden bg-slate-100 group">
                    {item.imageUrl ? (
                       <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${item.category === 'digital' ? 'bg-indigo-900' : 'bg-emerald-900'}`}>
                         <div className={`absolute inset-0 opacity-80 bg-gradient-to-br ${item.category === 'digital' ? 'from-indigo-600 to-purple-700' : 'from-emerald-500 to-teal-700'}`}></div>
                         <span className="text-8xl relative z-10 transform group-hover:scale-110 transition duration-500 filter drop-shadow-lg">{item.category === 'digital' ? '💻' : '📦'}</span>
                      </div>
                    )}
                     <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 uppercase tracking-wide z-20">{item.category}</div>
                  </div>
                </Link>

                <div className="p-6 flex-grow flex flex-col relative">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-extrabold text-slate-800 leading-tight line-clamp-2 group-hover:text-orange-600 transition">{item.title}</h3>
                    <div className="text-right">
                        <span className="block text-lg font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">${item.price}</span>
                        {/* Dynamic Crypto Preview (ETH by default) */}
                        <span className="text-xs text-orange-500 font-bold">~{(item.price / 3000).toFixed(3)} ETH</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{item.description}</p>
                  <div className="mt-auto space-y-4">
                    <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center text-xs text-white font-bold shadow-md">{item.seller?.username?.[0]?.toUpperCase() || 'S'}</div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{item.seller?.username || 'Unknown'}</span>
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wide">✓ Verified Seller</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => router.push(`/chat?with=${item.sellerId}`)} className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 transition border border-slate-200">💬 Chat</button>
                        <button onClick={() => initiateBuy(item)} className="py-3 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-orange-600 transition shadow-xl shadow-slate-900/20 transform active:scale-95">Connect & Buy</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />

      {/* --- WEB3 CHECKOUT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-bounce-in border border-slate-100 relative overflow-hidden">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-xl z-20">×</button>
            
            {/* STEP 1: SELECT COIN */}
            {checkoutStep === 'select-coin' && (
              <div className="text-center">
                 <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Select Currency</h2>
                 <p className="text-slate-500 text-sm mb-6">Which asset would you like to use?</p>

                 <div className="grid grid-cols-1 gap-3 mb-6">
                    {Object.keys(COIN_RATES).map(coin => (
                      <button 
                        key={coin}
                        onClick={() => { setSelectedCoin(coin); setCheckoutStep('confirm'); }}
                        className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition group"
                      >
                        <div className="flex items-center gap-3">
                           <span className="text-2xl">{COIN_RATES[coin].icon}</span>
                           <div className="text-left">
                              <span className="block font-bold text-slate-800">{COIN_RATES[coin].symbol}</span>
                              <span className="text-xs text-slate-400">{COIN_RATES[coin].network}</span>
                           </div>
                        </div>
                        <span className="font-mono text-sm font-bold text-slate-600 group-hover:text-orange-600">
                           {(selectedItem.price / COIN_RATES[coin].price).toFixed(coin === 'USDT' ? 2 : 5)}
                        </span>
                      </button>
                    ))}
                 </div>
              </div>
            )}

            {/* STEP 2: CONFIRM TRANSACTION */}
            {checkoutStep === 'confirm' && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                   <button onClick={() => setCheckoutStep('select-coin')} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase">Change Coin</button>
                </div>
                
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner animate-pulse">
                  {COIN_RATES[selectedCoin].icon}
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Sign Transaction</h2>
                <p className="text-slate-500 text-sm mb-6">Confirm purchase on {COIN_RATES[selectedCoin].network}</p>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 text-left">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-500">Item Cost</span>
                        <div className="text-right">
                             <span className="block font-bold text-slate-900">{getCryptoPrice()} {selectedCoin}</span>
                             <span className="text-xs text-slate-400">${selectedItem?.price} USD</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                        <span className="text-sm font-bold text-slate-500">Gas Fee (Est.)</span>
                        <span className="font-bold text-slate-900">{COIN_RATES[selectedCoin].gas} {selectedCoin}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-slate-900">Total</span>
                        <span className="text-xl font-black text-orange-600">{getTotalCrypto()} {selectedCoin}</span>
                    </div>
                </div>

                <div className="text-xs text-slate-400 mb-6 bg-yellow-50 text-yellow-700 p-2 rounded">
                    ⚠️ Ensure your wallet is connected to the <b>{COIN_RATES[selectedCoin].network}</b> Mainnet.
                </div>

                <button onClick={processCryptoPayment} className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg flex items-center justify-center gap-2">
                   <span>Sign & Pay</span>
                   <span>⚡</span>
                </button>
              </div>
            )}

            {/* STEP 3: PROCESSING */}
            {checkoutStep === 'processing' && (
              <div className="text-center py-10">
                <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold text-slate-900">Verifying on Blockchain...</h2>
                <p className="text-slate-500 mt-2 text-sm">Waiting for {COIN_RATES[selectedCoin].network} confirmation (1/3)</p>
                <div className="mt-6 font-mono text-xs text-slate-400 bg-slate-100 p-2 rounded truncate">
                    Tx: 0x71c...39a
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS */}
            {checkoutStep === 'success' && (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 animate-bounce">✓</div>
                <h2 className="text-3xl font-extrabold text-slate-900">Transaction Confirmed!</h2>
                <p className="text-slate-500 mt-2 mb-8">Ownership has been transferred.</p>
                
                <div className="bg-slate-50 p-4 rounded-xl text-left text-sm text-slate-600 mb-6 border border-slate-200">
                   <div className="flex justify-between mb-2"><span>Status:</span> <span className="font-bold text-green-600">Success</span></div>
                   <div className="flex justify-between mb-2"><span>Payment:</span> <span className="font-mono text-slate-800">{getTotalCrypto()} {selectedCoin}</span></div>
                   <div className="flex justify-between"><span>Gas Used:</span> <span className="font-mono text-slate-800">{COIN_RATES[selectedCoin].gas} {selectedCoin}</span></div>
                </div>
                
                <button onClick={() => setShowModal(false)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800">Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}