import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import API_URL from '../../lib/api'; // Use your centralized API URL
import { MapPin, User, Clock, Star, MessageSquare } from 'lucide-react';

export default function SellerProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      // 1. Fetch Seller Details
      const userRes = await axios.get(`${API_URL}/api/users/${id}`);
      setSeller(userRes.data);

      // 2. Fetch Their Active Listings
      // We filter listings where seller_id matches this profile
      const listingsRes = await axios.get(`${API_URL}/api/listings?seller=${userRes.data.username}`);
      setListings(listingsRes.data);
      
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">Loading Profile...</div>;
  if (!seller) return <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">User not found</div>;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 font-sans">
      <Navbar />

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12">
          
          {/* --- LEFT SIDEBAR (Seller Stats) --- */}
          <aside className="flex flex-col gap-6">
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 text-center relative">
               <div className="relative w-32 h-32 mx-auto mb-4">
                  {/* Fallback Image if no profile image exists */}
                  <img src={seller.profile_image || "https://via.placeholder.com/150"} alt={seller.username} className="w-full h-full object-cover rounded-full border-4 border-gray-800" />
               </div>
               
               <h1 className="text-2xl font-bold text-white mb-1">{seller.display_name || seller.username}</h1>
               <p className="text-gray-400 text-sm mb-4">{seller.tagline || "Member of HashMarket"}</p>
               
               <div className="flex items-center justify-center gap-4 mb-6 text-sm">
                  <span className="px-2 py-0.5 bg-gray-800 rounded text-xs border border-gray-700 capitalize">{seller.role}</span>
               </div>

               <button className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition" onClick={() => router.push(`/chat?with=${seller.id}`)}>
                  Contact Me
               </button>
            </div>

            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 text-sm space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-800">
                   <span className="text-gray-400 flex items-center gap-2"><User size={16}/> Joined</span>
                   <span className="font-bold text-white">{new Date(seller.created_at).toLocaleDateString()}</span>
                </div>
                {seller.wallet_address && (
                  <div className="py-2">
                     <span className="text-gray-400 flex items-center gap-2 mb-1"><MapPin size={16}/> Wallet</span>
                     <span className="font-bold text-white font-mono text-xs break-all">{seller.wallet_address}</span>
                  </div>
                )}
            </div>
          </aside>

          {/* --- MAIN CONTENT --- */}
          <main>
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 mb-8">
               <h3 className="text-xl font-bold text-white mb-4">About Me</h3>
               <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                 {seller.bio || "No bio available."}
               </p>
            </div>

            <h3 className="text-xl font-bold text-white mb-6">Active Listings ({listings.length})</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {listings.map((item) => (
                 <div key={item._id} className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden cursor-pointer hover:border-yellow-500/50 transition" onClick={() => router.push(`/product/${item._id}`)}>
                    <div className="h-48 overflow-hidden relative bg-gray-900">
                       <img src={item.image_url || "https://via.placeholder.com/300"} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                       <h4 className="font-bold text-white mb-2 line-clamp-2">{item.title}</h4>
                       <div className="flex justify-between items-center mt-4">
                          <span className="text-lg font-bold text-emerald-400">${item.price}</span>
                          <span className="text-xs text-gray-500 uppercase">{item.category}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </main>

        </div>
      </div>
      <Footer />
    </div>
  );
}