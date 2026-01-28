import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Fixed: next/router
import Navbar from '../../components/Navbar'; // Fixed: Added // for comment and fixed path
import Footer from '../../components/Footer'; // Fixed: Fixed path
import { MapPin, User, Clock, Star, MessageSquare, Calendar, CheckCircle } from 'lucide-react';

// --- MOCK DATA (Simulates fetching from MongoDB) ---
const MOCK_SELLER = {
  id: "shaybl123",
  username: "Shaybl",
  level: "Level 2 Seller",
  avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2574&auto=format&fit=crop",
  tagline: "Certified Full Stack Blockchain Developer",
  rating: 4.9,
  reviews: 403,
  location: "Nigeria",
  memberSince: "Dec 2024",
  avgResponse: "1 Hour",
  lastDelivery: "2 Days ago",
  bio: "I am a senior blockchain developer with 7+ years of experience. I specialize in Solidity, MERN Stack, and building secure DApps. I have deployed over 50 smart contracts to Mainnet.",
  languages: ["English (Fluent)", "Yoruba (Native)", "Spanish (Basic)"],
  skills: ["Solidity", "React.js", "Node.js", "Smart Contracts", "Web3 Integration"],
  products: [
    { id: 1, title: "Develop a Custom NFT Marketplace", price: "1.5 ETH", image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=3348&auto=format&fit=crop", category: "Development" },
    { id: 2, title: "Smart Contract Audit & Fixes", price: "0.5 ETH", image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=3432&auto=format&fit=crop", category: "Security" },
    { id: 3, title: "Figma to React/Next.js Conversion", price: "0.2 ETH", image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=3270&auto=format&fit=crop", category: "Frontend" }
  ]
};

export default function SellerProfile() {
  const router = useRouter();
  const { id } = router.query; // This captures the ID from the URL
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API Fetch
    if (id) {
      setTimeout(() => {
        setSeller(MOCK_SELLER); // In real app: fetch(`/api/users/${id}`)
        setLoading(false);
      }, 1000);
    }
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 font-sans">
      <Navbar />

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12">
          
          {/* --- LEFT SIDEBAR (Seller Stats) --- */}
          <aside className="flex flex-col gap-6">
            
            {/* Card 1: Main Info */}
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 text-center relative overflow-hidden group hover:border-yellow-500/30 transition duration-300">
               <div className="relative w-32 h-32 mx-auto mb-4">
                  <img src={seller.avatar} alt={seller.username} className="w-full h-full object-cover rounded-full border-4 border-gray-800 group-hover:border-yellow-500 transition duration-300" />
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-[#111827] rounded-full"></div>
               </div>
               
               <h1 className="text-2xl font-bold text-white mb-1">{seller.username}</h1>
               <p className="text-gray-400 text-sm mb-4">{seller.tagline}</p>
               
               <div className="flex items-center justify-center gap-4 mb-6 text-sm">
                  <div className="flex items-center text-yellow-400">
                    <Star size={16} className="fill-current mr-1" />
                    <span className="font-bold">{seller.rating}</span>
                    <span className="text-gray-500 ml-1">({seller.reviews})</span>
                  </div>
                  <span className="px-2 py-0.5 bg-gray-800 rounded text-xs border border-gray-700">{seller.level}</span>
               </div>

               <button className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl mb-3 hover:bg-yellow-400 transition">
                  Contact Me
               </button>
               <button className="w-full bg-transparent border border-gray-600 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">
                  Get a Quote
               </button>
            </div>

            {/* Card 2: Stats & Skills */}
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
               <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-800">
                     <span className="text-gray-400 flex items-center gap-2"><MapPin size={16}/> From</span>
                     <span className="font-bold text-white">{seller.location}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                     <span className="text-gray-400 flex items-center gap-2"><User size={16}/> Member Since</span>
                     <span className="font-bold text-white">{seller.memberSince}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                     <span className="text-gray-400 flex items-center gap-2"><MessageSquare size={16}/> Avg. Response</span>
                     <span className="font-bold text-white">{seller.avgResponse}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                     <span className="text-gray-400 flex items-center gap-2"><Clock size={16}/> Last Delivery</span>
                     <span className="font-bold text-white">{seller.lastDelivery}</span>
                  </div>
               </div>

               <div className="mt-6">
                 <h3 className="font-bold text-white mb-3">Skills</h3>
                 <div className="flex flex-wrap gap-2">
                   {seller.skills.map((skill, index) => (
                     <span key={index} className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700">
                       {skill}
                     </span>
                   ))}
                 </div>
               </div>
            </div>

          </aside>

          {/* --- MAIN CONTENT (Description & Gigs) --- */}
          <main>
            
            {/* Description Box */}
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 mb-8">
               <h3 className="text-xl font-bold text-white mb-4">About Me</h3>
               <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                 {seller.bio}
               </p>
               
               <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-white text-sm mb-2">Languages</h4>
                    <ul className="text-gray-400 text-sm space-y-1">
                      {seller.languages.map((lang, idx) => <li key={idx}>• {lang}</li>)}
                    </ul>
                  </div>
               </div>
            </div>

            {/* Seller's Gigs */}
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               Active Gigs <span className="text-sm font-normal text-gray-500">({seller.products.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {seller.products.map((item) => (
                 <div key={item.id} className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500/50 transition cursor-pointer group">
                    <div className="h-48 overflow-hidden relative">
                       <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                       <span className="absolute top-3 left-3 bg-black/60 backdrop-blur px-2 py-1 text-[10px] font-bold uppercase rounded text-white border border-white/10">{item.category}</span>
                    </div>
                    <div className="p-4">
                       <h4 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-500 transition">{item.title}</h4>
                       <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-800">
                          <span className="text-gray-500 text-xs">Starting at</span>
                          <span className="text-lg font-bold text-emerald-400">{item.price}</span>
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