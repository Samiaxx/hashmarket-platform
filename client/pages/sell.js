import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API_URL from '../lib/api';
import { useRouter } from 'next/router';
import { UploadCloud, Box, FileDigit, CheckCircle, DollarSign, Type } from 'lucide-react'; // Make sure to npm install lucide-react

export default function Sell() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('digital'); // 'digital' or 'physical'
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    imageUrl: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login to create a listing.");
        router.push('/login');
        return;
    }

    try {
      const res = await fetch(`${API_URL}/api/listings`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        body: JSON.stringify({ 
            ...formData, 
            category: activeCategory 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Error creating listing');

      router.push('/market');
    } catch (err) {
      console.error(err);
      alert("Failed to create listing.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-cyan-500 selection:text-black overflow-hidden relative">
      <Navbar />

      {/* BACKGROUND GLOW EFFECT */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <main className="container mx-auto px-6 py-12 relative z-10 max-w-4xl">
        
        {/* HEADER */}
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
                Create New <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Listing</span>
            </h1>
            <p className="text-slate-400 text-lg">
                Turn your assets into crypto. Set your price, define your terms.
            </p>
        </div>

        {/* GLASSMORPHISM FORM CONTAINER */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            
            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. CATEGORY SELECTION (Interactive Cards) */}
                <div>
                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Choose Asset Type</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Digital Card */}
                        <div 
                            onClick={() => setActiveCategory('digital')}
                            className={`cursor-pointer relative p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group ${
                                activeCategory === 'digital' 
                                ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                                : 'bg-[#0F131F] border-white/5 hover:border-white/20'
                            }`}
                        >
                            <div className={`p-3 rounded-xl ${activeCategory === 'digital' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-slate-400'}`}>
                                <FileDigit size={24} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg ${activeCategory === 'digital' ? 'text-white' : 'text-slate-300'}`}>Digital Product</h3>
                                <p className="text-xs text-slate-500">NFTs, Codes, Files, Services</p>
                            </div>
                            {activeCategory === 'digital' && <CheckCircle className="absolute top-4 right-4 text-cyan-500" size={20} />}
                        </div>

                        {/* Physical Card */}
                        <div 
                            onClick={() => setActiveCategory('physical')}
                            className={`cursor-pointer relative p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group ${
                                activeCategory === 'physical' 
                                ? 'bg-purple-500/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                                : 'bg-[#0F131F] border-white/5 hover:border-white/20'
                            }`}
                        >
                            <div className={`p-3 rounded-xl ${activeCategory === 'physical' ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                                <Box size={24} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg ${activeCategory === 'physical' ? 'text-white' : 'text-slate-300'}`}>Physical Good</h3>
                                <p className="text-xs text-slate-500">Electronics, Sneakers, Art</p>
                            </div>
                            {activeCategory === 'physical' && <CheckCircle className="absolute top-4 right-4 text-purple-500" size={20} />}
                        </div>
                    </div>
                </div>

                {/* 2. TITLE & PRICE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Item Title</label>
                        <div className="relative">
                            <Type className="absolute top-3.5 left-4 text-slate-500" size={18} />
                            <input 
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. 3D Model Pack" 
                                className="w-full bg-[#0F131F] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-cyan-500 focus:bg-cyan-500/5 outline-none transition"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Price (USD)</label>
                        <div className="relative">
                            <DollarSign className="absolute top-3.5 left-4 text-slate-500" size={18} />
                            <input 
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0.00" 
                                className="w-full bg-[#0F131F] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-cyan-500 focus:bg-cyan-500/5 outline-none transition font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. VISUAL IMAGE INPUT */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Image URL (Visual Asset)</label>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 transition duration-500 blur-md"></div>
                        <div className="relative bg-[#0F131F] border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center transition hover:border-cyan-500/50 group-hover:bg-[#151a29]">
                            <UploadCloud className="text-slate-500 mb-3 group-hover:text-cyan-400 transition" size={40} />
                            <input 
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="Paste your image link here (https://...)" 
                                className="w-full text-center bg-transparent border-none outline-none text-sm text-cyan-400 placeholder-slate-600 focus:placeholder-slate-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 4. DESCRIPTION */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                    <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Describe your item in detail..."
                        className="w-full bg-[#0F131F] border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500 focus:bg-cyan-500/5 outline-none transition resize-none"
                    ></textarea>
                </div>

                {/* SUBMIT BUTTON */}
                <button 
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white font-bold text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Creating Smart Contract..." : "🚀 Publish Listing"}
                </button>

            </form>
        </div>

      </main>
      <Footer />
    </div>
  );
}