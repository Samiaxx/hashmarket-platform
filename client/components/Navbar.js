import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null); 

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    
    const storedWallet = localStorage.getItem('wallet');
    if (storedWallet) setWallet(storedWallet);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('wallet'); 
    setUser(null);
    router.push('/login');
  };

  const connectWallet = () => {
    const randomAddr = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const shortAddr = `${randomAddr.substring(0, 6)}...${randomAddr.substring(38)}`;
    setWallet(shortAddr);
    localStorage.setItem('wallet', shortAddr);
    alert("Metamask Connected Successfully!");
  };

  return (
    // 1. Dark Glass Navbar Container
    <nav className="sticky top-0 z-50 w-full bg-[#050505]/80 backdrop-blur-md border-b border-[#262626]">
      <div className="container mx-auto px-6 md:px-12 h-20 flex justify-between items-center">
        
        {/* --- LOGO SECTION (White & Gold) --- */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-md group-hover:scale-105 transition duration-300 border border-gray-800">
             <img src="/logo.png" alt="HashMarket Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">
            Hash<span className="text-yellow-500">Market</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/market" className="text-sm font-bold text-gray-400 hover:text-yellow-500 transition uppercase tracking-wide">Market</Link>
          
          {user ? (
            <>
              {user.role === 'seller' && (
                <Link href="/sell" className="text-sm font-bold text-gray-400 hover:text-yellow-500 transition uppercase tracking-wide">Sell</Link>
              )}
              {user.role === 'admin' && (
                <Link href="/admin" className="text-sm font-bold text-red-500 hover:text-red-400 transition uppercase tracking-wide">Admin</Link>
              )}
              
              <Link href="/chat" className="text-gray-400 hover:text-yellow-500 transition font-bold text-sm uppercase tracking-wide">Messages</Link>

              {/* WALLET BUTTON (Dark/Gold Theme) */}
              <button 
                onClick={connectWallet}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition border ${
                  wallet 
                    ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50' 
                    : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{wallet ? '🟢' : '🦊'}</span>
                {wallet ? wallet : 'Connect Wallet'}
              </button>

              <div className="flex items-center gap-4 pl-4 border-l border-gray-800">
                <Link href="/dashboard" className="text-sm font-bold text-gray-300 hover:text-yellow-500 flex items-center gap-2">
                   <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold border border-gray-700">
                     {user.username[0].toUpperCase()}
                   </div>
                </Link>
                <button onClick={handleLogout} className="text-xs font-bold text-gray-500 hover:text-red-500 transition">Logout</button>
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-white py-2">Log In</Link>
              <Link href="/register" className="bg-yellow-500 text-black px-6 py-2 rounded-full font-bold hover:bg-yellow-600 transition text-sm shadow-lg shadow-yellow-500/20">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}