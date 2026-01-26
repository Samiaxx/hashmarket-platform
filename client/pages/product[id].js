import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API_URL from '../lib/api';
import Link from 'next/link';
import CryptoPrice from '../components/CryptoPrice'; // Import Converter

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) fetchProduct();
    const storedWallet = localStorage.getItem('wallet');
    if (storedWallet) setWallet(storedWallet);
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/listings`);
      const found = res.data.find(p => p._id === id || p.id === id);
      setItem(found);
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  const handleCryptoBuy = async () => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    const currentWallet = localStorage.getItem('wallet');
    if (!currentWallet) {
      alert("⚠️ Crypto Wallet Required!\n\nPlease connect your MetaMask or TrustWallet in the Navbar to purchase.");
      return;
    }

    if (!confirm(`Confirm Purchase?\n\nSend ${item.price} USD worth of Crypto to Escrow Smart Contract?`)) return;

    setProcessing(true);

    try {
      setTimeout(async () => {
        const mockTxHash = "0x" + Math.random().toString(36).substring(2) + "..." + Math.random().toString(36).substring(2);
        
        await axios.post(`${API_URL}/api/orders`, {
          listingId: item._id || item.id,
          amount: item.price,
          txHash: mockTxHash
        }, { headers: { 'x-auth-token': token } });

        alert(`✅ Payment Successful!\nTX Hash: ${mockTxHash}\n\nFunds are held in Escrow until you confirm receipt.`);
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      alert("Transaction Failed.");
      setProcessing(false);
    }
  };

  if (!item && !loading) return <div className="p-20 text-center text-white bg-[#0B0F19] min-h-screen">Product Not Found</div>;

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col font-sans text-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-6 md:px-12 py-12 flex-grow max-w-7xl">
        <button onClick={() => router.back()} className="mb-6 text-gray-500 hover:text-white font-bold flex items-center gap-2 transition">
          ← Back to Market
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* LEFT: IMAGE */}
          <div className="rounded-3xl shadow-2xl overflow-hidden h-[500px] bg-[#111827] flex items-center justify-center relative border border-gray-800">
            {item?.image_url ? (
              <img src={item.image_url} className="w-full h-full object-cover" />
            ) : (
              <div className="text-9xl opacity-50">
                {item?.category === 'digital' ? '💻' : item?.category === 'freelance' ? '🤝' : '📦'}
              </div>
            )}
            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md text-white px-4 py-1 rounded-full text-sm font-bold border border-white/10">
              {item?.category?.toUpperCase()}
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 leading-tight">{item?.title}</h1>
            
            {/* --- NEW: TRUST BADGES & SELLER INFO --- */}
            <div className="flex flex-wrap items-center gap-4 mb-8 mt-4 p-4 bg-[#111827] rounded-xl border border-gray-800">
               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xl font-bold border border-gray-600 text-white">
                  {item?.sellerName?.[0]?.toUpperCase() || 'S'}
               </div>

               <div className="flex-1">
                  <div className="flex items-center gap-3">
                     <span className="text-white font-bold text-lg">{item?.sellerName || 'Unknown Seller'}</span>
                     
                     {/* Dynamic Badge */}
                     {item?.isNewSeller ? (
                         <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase">
                           🌱 New Seller
                         </span>
                     ) : (
                         <span className="bg-yellow-500/10 text-yellow-500 text-[10px] px-2 py-0.5 rounded border border-yellow-500/20 font-bold uppercase flex items-center gap-1">
                           🛡️ Verified Pro
                         </span>
                     )}
                  </div>

                  {/* Wallet Age Mockup */}
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                     <span>🗓️ Wallet Age: {item?.isNewSeller ? '< 1 Month' : '1+ Years'}</span>
                     <span className="text-emerald-500 font-bold">98% Positive Feedback</span>
                  </div>
               </div>
            </div>

            {/* --- NEW: PRICE & CONVERTER --- */}
            <div className="flex items-end justify-between mb-8 border-b border-gray-800 pb-8">
                <div>
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Current Price</p>
                    <div className="text-5xl font-black text-white tracking-tight">${item?.price}</div>
                </div>
                <div className="mb-2">
                    <CryptoPrice usdPrice={item?.price} />
                </div>
            </div>

            <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800 mb-8">
              <h3 className="font-bold text-gray-300 mb-2 uppercase text-xs tracking-wider">Description</h3>
              <p className="text-gray-400 leading-relaxed">{item?.description}</p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => router.push(`/chat?with=${item?.seller_id}`)} className="py-4 rounded-xl font-bold text-gray-300 border border-gray-700 hover:border-white hover:text-white transition">
                💬 Chat & Offer
              </button>

              <button 
                onClick={handleCryptoBuy}
                disabled={processing}
                className={`py-4 rounded-xl font-bold text-black shadow-xl transition flex flex-col items-center justify-center ${processing ? 'bg-gray-600' : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:scale-[1.02]'}`}
              >
                {processing ? (
                  <span>Processing Blockchain...</span>
                ) : (
                  <>
                    <span>Pay with Crypto</span>
                    <span className="text-[10px] font-normal opacity-80">Escrow Protected</span>
                  </>
                )}
              </button>
            </div>
            
            {!wallet && (
                <p className="text-red-500 text-xs text-center mt-3 font-bold bg-red-500/10 p-2 rounded">
                    ⚠️ You must connect wallet in Navbar to buy
                </p>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}