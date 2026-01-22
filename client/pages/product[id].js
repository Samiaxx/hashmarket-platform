import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      // Fetch list and find item by ID
      const res = await axios.get('http://localhost:5000/api/listings');
      const found = res.data.find(p => p._id === id);
      setItem(found);
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  if (!item && !loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
          <button onClick={() => router.back()} className="text-emerald-600 mt-4 hover:underline">Go Back</button>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">
      Loading details...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <div className="container mx-auto px-6 md:px-12 py-12 flex-grow">
        {/* Back Button */}
        <button onClick={() => router.back()} className="mb-6 text-slate-500 hover:text-slate-900 font-bold flex items-center gap-2 transition">
          ← Back to Market
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* LEFT: IMAGE AREA (Real Image or Gradient Fallback) */}
          <div className="rounded-3xl shadow-2xl overflow-hidden h-[500px] flex items-center justify-center relative bg-slate-100 group">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${item.category === 'digital' ? 'bg-indigo-900' : 'bg-emerald-900'}`}>
                <div className={`absolute inset-0 opacity-80 bg-gradient-to-br ${item.category === 'digital' ? 'from-indigo-600 to-purple-700' : 'from-emerald-500 to-teal-700'}`}></div>
                <span className="text-9xl relative z-10 filter drop-shadow-xl animate-blob">
                  {item.category === 'digital' ? '💻' : '📦'}
                </span>
              </div>
            )}
            
            <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md text-white px-4 py-1 rounded-full text-sm font-bold border border-white/10 z-20">
              {item.category.toUpperCase()}
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">{item.title}</h1>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl font-black text-emerald-600">${item.price}</span>
              <div className="h-8 w-[1px] bg-slate-300"></div>
              
              {/* SELLER LINK */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center text-sm text-white font-bold shadow">
                  {item.seller?.username?.[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                   <Link href={`/seller/${item.sellerId}`} className="block text-sm font-bold text-slate-600 hover:text-emerald-600 hover:underline transition">
                     Sold by {item.seller?.username || 'Unknown'}
                   </Link>
                   <span className="block text-xs font-bold text-emerald-500">✓ Verified Merchant</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8">
              <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">Description</h3>
              <p className="text-slate-600 leading-relaxed text-lg">{item.description}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-400">
                <span>🛡️ Hybrid Escrow Protected</span>
                <span>•</span>
                <span>🚀 Instant Delivery</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => router.push(`/chat?with=${item.sellerId}`)} className="py-4 rounded-xl font-bold text-slate-700 border-2 border-slate-200 hover:border-slate-800 hover:text-slate-900 transition flex items-center justify-center gap-2">
                <span>💬</span> Ask Question
              </button>
              {/* Buy Now links to Chat to encourage Negotiation Flow */}
              <button onClick={() => router.push(`/chat?with=${item.sellerId}`)} className="py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-emerald-600 transition shadow-xl shadow-slate-900/20 transform active:scale-95">
                Negotiate / Buy
              </button>
            </div>

            {/* REVIEWS SECTION */}
            <div className="mt-12">
              <h3 className="font-bold text-slate-900 mb-4 text-xl">Recent Reviews</h3>
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-400 text-lg">★★★★★</span>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Verified Buyer</span>
                  </div>
                  <p className="text-slate-700 font-medium text-sm">"Great item! Exactly as described. Fast delivery and secure transaction."</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-400 text-lg">★★★★☆</span>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">CryptoUser123</span>
                  </div>
                  <p className="text-slate-700 font-medium text-sm">"Quality is amazing, but shipping took 2 days longer than expected."</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}