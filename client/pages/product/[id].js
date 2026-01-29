import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import API_URL from '../../lib/api'; // Ensure this points to your API

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Calls the new SINGLE item route we just made
      const res = await axios.get(`${API_URL}/api/listings/${id}`);
      setItem(res.data);
    } catch (err) {
      console.error("Failed to load product", err);
      setError("Item not found or has been removed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = () => {
    // Redirect to chat or payment flow
    const token = localStorage.getItem('token');
    if(!token) {
        alert("Please login to purchase");
        router.push('/login');
        return;
    }
    // Simple alert for now - connect to your Chat/Order system later
    alert(`Starting secure escrow for: ${item.title}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error || !item) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{error || "Item not found"}</h1>
        <button onClick={() => router.push('/market')} className="text-blue-600 hover:underline">
            ← Back to Market
        </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 grid grid-cols-1 md:grid-cols-2">
            
            {/* Left: Image Section */}
            <div className="h-96 md:h-auto bg-gray-100 relative group">
                <img 
                    src={item.image_url || "https://via.placeholder.com/600"} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Right: Details Section */}
            <div className="p-8 md:p-12 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            {item.category}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${item.status === 'APPROVED' ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>
                            {item.status}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                        {item.title}
                    </h1>

                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                {item.sellerImage ? (
                                    <img src={item.sellerImage} alt="Seller" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs">
                                        {item.sellerName?.[0]?.toUpperCase()}
                                    </div>
                                )}
                             </div>
                             <div>
                                 <p className="text-xs text-gray-500">Listed by</p>
                                 <p className="text-sm font-bold text-gray-900 cursor-pointer hover:underline" onClick={() => router.push(`/seller/${item.sellerName}`)}>
                                     @{item.sellerName || "Unknown"}
                                 </p>
                             </div>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 uppercase mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed mb-8 whitespace-pre-line">
                        {item.description}
                    </p>
                </div>

                {/* Pricing & Action */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Current Price</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-gray-900">{item.price} ETH</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleBuy}
                        className="w-full bg-black text-white font-bold text-lg py-4 rounded-lg hover:bg-gray-800 transition transform active:scale-95 shadow-lg"
                    >
                        Buy Now via Escrow
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3">
                        Funds are held in secure escrow until you confirm receipt.
                    </p>
                </div>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}