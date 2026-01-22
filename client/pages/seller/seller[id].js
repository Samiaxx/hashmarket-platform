import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';

export default function SellerProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // 1. Get User Details (Public)
      const userRes = await axios.get(`http://localhost:5000/api/users/${id}`);
      setProfile(userRes.data);

      // 2. Get User's Active Listings (using existing or temp token)
      // Note: In a real app, this endpoint might be public, but we reused the auth one.
      // We'll simulate a public fetch or require login. 
      const token = localStorage.getItem('token');
      if(token) {
        const itemsRes = await axios.get(`http://localhost:5000/api/listings/seller/${id}`, {
            headers: { 'x-auth-token': token }
        });
        setItems(itemsRes.data);
      }
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  if (!profile) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">User not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* HEADER BANNER */}
      <div className="h-48 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 to-slate-900 opacity-80"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="container mx-auto px-6 md:px-12 -mt-20 relative z-10 flex-grow pb-20">
        
        {/* PROFILE CARD */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center md:items-end gap-6 mb-12">
            
            {/* Avatar */}
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-5xl text-white font-bold shadow-lg border-4 border-white">
                {profile.username[0].toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h1 className="text-3xl font-extrabold text-slate-900">{profile.username}</h1>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full uppercase">Verified Merchant</span>
                </div>
                <p className="text-slate-500 mb-4">Member since {profile.joinDate}</p>
                
                {/* Stats Grid */}
                <div className="flex justify-center md:justify-start gap-8">
                    <div>
                        <span className="block text-2xl font-black text-slate-800">{items.length}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Active Listings</span>
                    </div>
                    <div>
                        <span className="block text-2xl font-black text-slate-800">{profile.salesCount}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Sales</span>
                    </div>
                    <div>
                        <span className="block text-2xl font-black text-emerald-500">{profile.trustScore}%</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Trust Score</span>
                    </div>
                </div>
            </div>

            {/* Action */}
            <button onClick={() => router.push(`/chat?with=${profile.id}`)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition shadow-lg w-full md:w-auto">
                Contact Seller
            </button>
        </div>

        {/* SELLER INVENTORY */}
        <h2 className="text-2xl font-bold text-slate-800 mb-6 border-l-4 border-emerald-500 pl-4">Current Inventory</h2>
        
        {items.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-400">This seller has no active items.</p>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map(item => (
                <div key={item._id} className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col h-full">
                    <Link href={`/product/${item._id}`}>
                    <div className="cursor-pointer h-56 flex items-center justify-center relative overflow-hidden bg-slate-100 group">
                        {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                        ) : (
                        <div className={`w-full h-full flex items-center justify-center ${item.category === 'digital' ? 'bg-indigo-900' : 'bg-emerald-900'}`}>
                            <div className={`absolute inset-0 opacity-80 bg-gradient-to-br ${item.category === 'digital' ? 'from-indigo-600 to-purple-700' : 'from-emerald-500 to-teal-700'}`}></div>
                            <span className="text-7xl relative z-10 filter drop-shadow-lg">{item.category === 'digital' ? '💻' : '📦'}</span>
                        </div>
                        )}
                    </div>
                    </Link>

                    <div className="p-6 flex-grow flex flex-col relative">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-1">{item.title}</h3>
                        <span className="font-bold text-emerald-600">${item.price}</span>
                    </div>
                    <Link href={`/product/${item._id}`}>
                        <button className="w-full mt-4 py-2 rounded-lg font-bold text-sm text-slate-600 bg-slate-50 hover:bg-slate-900 hover:text-white transition">View Item</button>
                    </Link>
                    </div>
                </div>
                ))}
            </div>
        )}

      </div>
      <Footer />
    </div>
  );
}