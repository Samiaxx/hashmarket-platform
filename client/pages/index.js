import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  
  // --- LIVE CRYPTO DATA STATE ---
  const [cryptoData, setCryptoData] = useState([]);
  const [loadingCrypto, setLoadingCrypto] = useState(true);

  // --- TESTIMONIALS STATE ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonials = [
    {
      id: 1,
      quote: "I bought a mining rig and hired a developer to set it up in the same transaction. HashMarket is the only place this is possible.",
      name: "David K.",
      role: "Crypto Miner",
      image: "https://i.pravatar.cc/150?u=miner_dave",
      borderColor: "border-emerald-500/50",
      textColor: "text-emerald-400"
    },
    {
      id: 2,
      quote: "The escrow system gives me total peace of mind. I hire developers for my DeFi projects and only pay when the code is shipped and verified.",
      name: "Michael Chen",
      role: "DeFi Founder",
      image: "https://i.pravatar.cc/150?u=michael_chen",
      borderColor: "border-blue-500/50",
      textColor: "text-blue-400"
    },
    {
      id: 3,
      quote: "Finally a marketplace that understands crypto natives. No more banking delays, frozen funds, or high fees. Just pure P2P commerce.",
      name: "Alex V.",
      role: "NFT Artist",
      image: "https://i.pravatar.cc/150?u=alex_nft",
      borderColor: "border-purple-500/50",
      textColor: "text-purple-400"
    }
  ];

  // --- FETCH LIVE CRYPTO DATA ---
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Fetching Bitcoin, Ethereum, Tether, USDC, Solana
        const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,usd-coin,solana&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=24h');
        const data = await res.json();
        if (Array.isArray(data)) {
          setCryptoData(data);
        }
      } catch (error) {
        console.error("Crypto API Rate Limited or Error", error);
        // Fallback data if API fails
        setCryptoData([
            { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 64230, price_change_percentage_24h: 2.4, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
            { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3450, price_change_percentage_24h: -1.2, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
            { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.00, price_change_percentage_24h: 0.01, image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png' },
            { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 145, price_change_percentage_24h: 5.7, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
            { id: 'usd-coin', symbol: 'usdc', name: 'USDC', current_price: 1.00, price_change_percentage_24h: 0.00, image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png' }
        ]);
      } finally {
        setLoadingCrypto(false);
      }
    };

    fetchPrices();
    // Refresh every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- SLIDER LOGIC ---
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="relative w-full min-h-[950px] flex flex-col items-center justify-center overflow-hidden border-b border-slate-800">
        
        {/* VIDEO BACKGROUND */}
        <video 
          autoPlay loop muted playsInline 
          className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-40"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-futuristic-lines-and-dots-996-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950 z-10"></div> 

        {/* HERO CONTENT */}
        <div className="relative z-20 container mx-auto px-6 text-center mt-20">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live on Mainnet
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight drop-shadow-2xl">
            The World's First <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Hybrid Marketplace</span> <br />
            for Physical & Digital Assets.
          </h1>

          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Hire freelancers, buy electronics, and trade real-world assets securely with Crypto Escrow.
          </p>

          {/* SEARCH & CTA */}
          <div className="max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-3 rounded-2xl shadow-2xl flex flex-col gap-4 mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl opacity-20 group-hover:opacity-30 transition blur-md"></div>
              <div className="relative flex items-center bg-slate-900/80 rounded-xl overflow-hidden border border-slate-700 group-hover:border-slate-500 transition">
                <span className="pl-6 text-slate-400 text-xl">🔍</span>
                <input 
                  type="text" 
                  placeholder="Find developers, luxury watches, or copywriting..." 
                  className="w-full bg-transparent text-white px-4 py-5 text-lg outline-none placeholder-slate-500 font-medium"
                />
                <button className="mr-2 bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-500 transition shadow-lg">
                  Search
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/market" className="flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition group">
                <span className="text-2xl group-hover:scale-110 transition">🛍️</span>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-200">I want to Buy</div>
                  <div className="text-xs text-slate-500">Hire talent or buy assets</div>
                </div>
              </Link>
              <Link href="/sell" className="flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition group">
                <span className="text-2xl group-hover:scale-110 transition">💼</span>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-200">I want to Sell</div>
                  <div className="text-xs text-slate-500">List services or items</div>
                </div>
              </Link>
            </div>
          </div>

          {/* FEATURE 4: LIVE MARKET ANALYSIS (NEW) */}
          <div className="w-full max-w-5xl mx-auto">
             <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px bg-slate-800 w-12"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Market Analysis</span>
                <div className="h-px bg-slate-800 w-12"></div>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {cryptoData.map((coin) => (
                  <div key={coin.id} className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col items-center hover:border-slate-600 transition group backdrop-blur-md">
                      <div className="flex items-center gap-2 mb-1">
                          <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
                          <span className="text-xs font-bold text-slate-300 uppercase">{coin.symbol}</span>
                      </div>
                      <div className="text-sm font-bold text-white">
                          ${coin.current_price.toLocaleString()}
                      </div>
                      <div className={`text-[10px] font-bold flex items-center gap-1 ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {coin.price_change_percentage_24h >= 0 ? '▲' : '▼'}
                          {coin.price_change_percentage_24h.toFixed(2)}%
                      </div>
                  </div>
                ))}
             </div>
          </div>

        </div>
      </div>

      {/* FEATURE 5: LIVE STATS BAR */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm relative z-30">
        <div className="container mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800">
          <div>
            <div className="text-3xl font-black text-white">$4.2M+</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Volume</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">12,500+</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">8,430</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Jobs Completed</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">0%</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Fiat Friction</div>
          </div>
        </div>
      </div>

      {/* FEATURE 3: HOW IT WORKS */}
      <section className="py-24 bg-slate-950 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">How HashMarket Works</h2>
            <p className="text-slate-400">Secure P2P trading powered by Smart Contract Escrow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 z-0"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-4xl shadow-xl mb-6">🛒</div>
              <h3 className="text-xl font-bold text-white mb-2">1. Browse & Order</h3>
              <p className="text-slate-400 text-sm max-w-xs">Find a freelancer or physical item. Place an order instantly using your crypto wallet.</p>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-blue-500/50 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(59,130,246,0.2)] mb-6">🔒</div>
              <h3 className="text-xl font-bold text-white mb-2">2. Secure Deposit</h3>
              <p className="text-slate-400 text-sm max-w-xs">Your funds are locked in a Smart Contract Escrow. The seller sees proof of funds but cannot access them.</p>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-emerald-500/50 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(16,185,129,0.2)] mb-6">🤝</div>
              <h3 className="text-xl font-bold text-white mb-2">3. Release & Receive</h3>
              <p className="text-slate-400 text-sm max-w-xs">Once you approve the work or receive the item, you release the funds to the seller instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 1: HYBRID CATEGORIES */}
      <section className="py-24 bg-slate-900 relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold uppercase mb-4">Hybrid Ecosystem</div>
            <h2 className="text-3xl font-bold mb-4 text-white">Explore Our Marketplace</h2>
            <p className="text-slate-400">From digital code to physical gold, buy it all with crypto.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><span className="text-blue-500">💻</span> Digital Services</h3>
              <div className="grid grid-cols-2 gap-4">
                {['Web Development', 'Smart Contracts', 'NFT Art & Design', 'Copywriting'].map((cat) => (
                    <Link key={cat} href={`/market?cat=${cat.toLowerCase().replace(' ', '-')}`} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-blue-600 hover:border-blue-500 transition group cursor-pointer">
                        <div className="font-bold text-slate-200">{cat}</div>
                    </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><span className="text-emerald-500">📦</span> Physical Assets</h3>
              <div className="grid grid-cols-2 gap-4">
                {['Electronics & Mining', 'Luxury Watches', 'Collectibles', 'Hardware Wallets'].map((cat) => (
                    <Link key={cat} href={`/market?cat=${cat.toLowerCase().replace(' ', '-')}`} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-emerald-600 hover:border-emerald-500 transition group cursor-pointer">
                        <div className="font-bold text-slate-200">{cat}</div>
                    </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-slate-950 border-t border-slate-900 z-20 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white">Success speaks for itself</h2>
              <p className="text-slate-500 mt-2">Trusted by miners, developers, and traders worldwide.</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
               <button onClick={prevSlide} className="w-12 h-12 rounded-full border border-slate-700 hover:bg-slate-800 text-white flex items-center justify-center transition active:scale-95">←</button>
               <button onClick={nextSlide} className="w-12 h-12 rounded-full border border-blue-600 bg-blue-600 text-white hover:bg-blue-500 flex items-center justify-center transition active:scale-95 shadow-lg"> → </button>
            </div>
          </div>

          <div className="bg-slate-900 p-10 rounded-2xl border border-slate-800 relative max-w-4xl mx-auto shadow-xl min-h-[250px] flex flex-col justify-center">
             <div className="absolute -top-6 -left-4 text-7xl text-blue-900 opacity-50 font-serif">"</div>
             <div key={currentIndex} className="animate-in fade-in zoom-in duration-300">
                 <p className="text-xl text-slate-300 italic mb-8 leading-relaxed font-light">"{testimonials[currentIndex].quote}"</p>
             </div>
             <div className="flex items-center gap-4">
                <div className={`w-14 h-14 bg-slate-700 rounded-full overflow-hidden border-2 ${testimonials[currentIndex].borderColor}`}>
                   <img src={testimonials[currentIndex].image} alt="User" className="w-full h-full object-cover" />
                </div>
                <div>
                   <h4 className="font-bold text-white text-lg">{testimonials[currentIndex].name}</h4>
                   <p className={`text-xs ${testimonials[currentIndex].textColor} font-bold uppercase tracking-wider`}>{testimonials[currentIndex].role}</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-24 relative overflow-hidden z-20 bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 z-0 opacity-80"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px]"></div>

        <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
          <h2 className="text-4xl font-extrabold text-white mb-6">Join the Decentralized Economy</h2>
          <p className="text-slate-400 mb-10 text-lg">Stay updated with the latest high-paying crypto gigs and market trends.</p>

          <div className="flex flex-col sm:flex-row gap-4 bg-white/5 p-2 rounded-2xl backdrop-blur-sm border border-white/5 shadow-2xl">
            <input type="email" placeholder="Enter your email address..." value={email} onChange={(e) => setEmail(e.target.value)} className="flex-grow bg-transparent text-white px-6 py-4 outline-none placeholder-slate-500 font-medium" />
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-10 py-4 rounded-xl hover:shadow-lg hover:scale-105 transition border border-blue-500/50">Subscribe</button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}