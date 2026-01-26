import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from "../lib/api";
import Link from "next/link";
import CryptoPrice from "../components/CryptoPrice";

export default function Market() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/listings`)
      .then((res) => res.json())
      .then((data) => {
        setListings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-gray-100 font-sans">
      <Navbar />

      {/* HEADER SECTION */}
      <div className="bg-[#111827] border-b border-gray-800 py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Marketplace</h1>
          <p className="text-gray-400 max-w-2xl">
            Discover premium digital assets, physical goods, and freelance services. 
            Secured by smart contract escrow.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-grow container mx-auto px-6 max-w-7xl py-12">
        
        {/* FILTERS & SEARCH */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full md:max-w-md bg-[#1F2937] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-yellow-500 transition"
          />
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <button className="px-5 py-2 bg-gray-800 text-white rounded-xl border border-gray-700 text-sm font-bold whitespace-nowrap hover:bg-gray-700">All Items</button>
            <button className="px-5 py-2 bg-transparent text-gray-400 rounded-xl hover:text-white hover:bg-gray-800 text-sm font-bold whitespace-nowrap transition">Digital</button>
            <button className="px-5 py-2 bg-transparent text-gray-400 rounded-xl hover:text-white hover:bg-gray-800 text-sm font-bold whitespace-nowrap transition">Physical</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse">Loading Blockchain Data...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-[#111827] rounded-2xl border border-gray-800 border-dashed">
            <h3 className="text-xl font-bold text-gray-300">No Listings Yet</h3>
            <p className="text-gray-500 mb-6">Be the first to list an item on the HashMarket.</p>
            <Link href="/sell" className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition">
              Create Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((item) => (
              <Link href={`/product/${item._id}`} key={item._id}>
                <div className="bg-[#111827] rounded-xl overflow-hidden border border-gray-800 hover:border-yellow-500/50 hover:shadow-2xl hover:shadow-yellow-500/10 transition duration-300 group h-full flex flex-col cursor-pointer">
                  
                  {/* IMAGE AREA */}
                  <div className="h-52 bg-gray-900 relative overflow-hidden flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                    ) : (
                      <span className="text-6xl opacity-20 grayscale group-hover:grayscale-0 transition">
                        {item.category === 'digital' ? '💻' : '📦'}
                      </span>
                    )}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase px-2 py-1 rounded border border-white/10">
                      {item.category}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-yellow-500 transition">{item.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">{item.description}</p>
                    
                    {/* PRICE & CONVERTER SECTION */}
                    <div className="flex items-end justify-between pt-4 border-t border-gray-800 mt-auto">
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Price (USD)</span>
                        <span className="text-xl font-extrabold text-yellow-500">${item.price}</span>
                      </div>
                      
                      {/* Live Converter Badge */}
                      <CryptoPrice usdPrice={item.price} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}