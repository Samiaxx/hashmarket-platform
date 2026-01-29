import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { ethers } from 'ethers';
import { Bell, Search, ChevronDown, LogOut, User, Settings, Wallet, Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const dropdownRef = useRef(null);
  
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. Load User & Wallet from Storage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedWallet = localStorage.getItem('wallet');
    
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedWallet) setWallet(storedWallet);

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          localStorage.setItem('wallet', accounts[0]);
        } else {
          setWallet(null);
          localStorage.removeItem('wallet');
        }
      });
    }

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Connect Wallet Logic (FIXED: Handles User Rejection)
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this feature!");
      return;
    }
    
    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      // This line triggers the popup. If user clicks "Cancel", it throws an error.
      const accounts = await provider.send("eth_requestAccounts", []);
      
      const address = accounts[0];
      setWallet(address);
      localStorage.setItem('wallet', address);
      
    } catch (error) {
      // FIX: Check if the user simply rejected the request
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        console.warn("User rejected wallet connection."); // Warn is better than Error (doesn't crash app)
      } else {
        console.error("Wallet connection failed:", error);
        alert("Failed to connect wallet. See console for details.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // 3. Logout Logic
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setWallet(null);
    router.push('/login');
    setIsMobileMenuOpen(false);
  };

  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    // GLASSMORPHISM HEADER
    <nav className="sticky top-0 z-[100] w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6 h-20 flex justify-between items-center relative">
        
        {/* --- LEFT: BRANDING --- */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group z-50">
          <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-500">
             <div className="w-full h-full bg-black rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-blue-500">H</span>
             </div>
          </div>
          <span className="text-lg md:text-2xl font-black text-white tracking-tighter">
            Hash<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Market</span>
          </span>
        </Link>

        {/* --- RIGHT (MOBILE): COMPACT ACTIONS --- */}
        <div className="flex items-center gap-3 md:hidden z-50">
          {!wallet && (
             <button 
               onClick={connectWallet}
               className="bg-white/5 text-cyan-400 p-2.5 rounded-xl border border-white/10 active:scale-95 transition backdrop-blur-md"
             >
               <Wallet size={20} />
             </button>
          )}
          
          <button 
            className="text-white bg-white/5 p-2.5 rounded-xl border border-white/10 active:scale-95 transition backdrop-blur-md"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* --- CENTER: GLOBAL SEARCH (Desktop) --- */}
        <div className="hidden lg:flex items-center bg-white/5 rounded-2xl px-4 py-2.5 border border-white/5 w-80 xl:w-96 transition-all focus-within:border-cyan-500/50 focus-within:bg-white/10 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <Search size={18} className="text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder="Search assets, services..." 
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-500 font-medium"
            />
        </div>

        {/* --- RIGHT: DESKTOP NAVIGATION --- */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/market" className="text-sm font-bold text-gray-400 hover:text-white transition-colors tracking-wide mr-2">Explore</Link>
          
          {user ? (
            // LOGGED IN VIEW
            <>
              {user.role === 'seller' && (
                <Link href="/sell" className="text-sm font-bold text-gray-400 hover:text-cyan-400 transition-colors tracking-wide">Sell</Link>
              )}
              <Link href="/chat" className="text-gray-400 hover:text-white transition-colors font-bold text-sm tracking-wide">Messages</Link>

              {/* Notification Bell */}
              <button className="relative p-2.5 text-gray-400 hover:text-white transition hover:bg-white/5 rounded-xl active:scale-95">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse"></span>
              </button>

              {/* Wallet Button */}
              <button 
                onClick={connectWallet}
                disabled={isConnecting}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 border ${
                  wallet 
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border-white/10'
                }`}
              >
                <Wallet size={16} />
                {isConnecting ? '...' : wallet ? `${wallet.substring(0, 6)}...` : 'Connect'}
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 pl-4 border-l border-white/10 group"
                >
                   <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] group-hover:scale-105 transition-transform">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white font-bold text-xs">
                        {user.username ? user.username[0].toUpperCase() : 'U'}
                      </div>
                   </div>
                   <ChevronDown size={14} className="text-gray-500 group-hover:text-white transition" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-14 w-64 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-5 py-4 border-b border-white/5">
                      <p className="text-sm text-white font-bold tracking-wide">{user.username}</p>
                      <p className="text-xs text-gray-500 truncate font-mono mt-1">{user.email}</p>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-3 px-5 py-3 text-gray-400 hover:bg-white/5 hover:text-cyan-400 transition text-sm font-medium">
                      <User size={16} /> Dashboard
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 px-5 py-3 text-gray-400 hover:bg-white/5 hover:text-cyan-400 transition text-sm font-medium">
                      <Settings size={16} /> Settings
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-red-500 hover:bg-red-500/10 transition text-sm text-left font-medium">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // LOGGED OUT VIEW - THE FIX FOR VISIBILITY
            <div className="flex gap-3 items-center ml-2">
              <Link 
                href="/login" 
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition backdrop-blur-md flex items-center gap-2"
              >
                Log In
              </Link>
              <Link 
                href="/register" 
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* --- MOBILE SLIDE-OVER DRAWER --- */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMobile}
      />

      <div className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-[#0a0a0a]/95 backdrop-blur-2xl border-l border-white/10 z-[120] transform transition-transform duration-300 ease-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
           
           {/* Drawer Header */}
           <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-black text-white tracking-tighter">Menu</span>
              <button onClick={closeMobile} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white active:scale-90 transition">
                <X size={24} />
              </button>
           </div>

           {/* Mobile Search */}
           <div className="flex items-center bg-white/5 rounded-2xl px-4 py-3 border border-white/5 mb-8 focus-within:border-cyan-500/50 transition-colors">
              <Search size={20} className="text-gray-500 mr-3" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500 text-base" />
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-2">
            <Link href="/market" onClick={closeMobile} className="flex items-center justify-between text-lg font-bold text-gray-300 hover:text-white hover:bg-white/5 p-3 rounded-xl transition-all group">
              Explore Markets <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-cyan-400" />
            </Link>
            
            {user && (
              <>
                <Link href="/sell" onClick={closeMobile} className="flex items-center justify-between text-lg font-bold text-gray-300 hover:text-white hover:bg-white/5 p-3 rounded-xl transition-all group">
                  Sell Services <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-cyan-400" />
                </Link>
                <Link href="/chat" onClick={closeMobile} className="flex items-center justify-between text-lg font-bold text-gray-300 hover:text-white hover:bg-white/5 p-3 rounded-xl transition-all group">
                  Messages <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-cyan-400" />
                </Link>
                <Link href="/dashboard" onClick={closeMobile} className="flex items-center justify-between text-lg font-bold text-gray-300 hover:text-white hover:bg-white/5 p-3 rounded-xl transition-all group">
                  Dashboard <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-cyan-400" />
                </Link>
              </>
            )}
          </div>
          
          {/* Bottom Actions */}
          <div className="mt-auto space-y-4 pb-6">
            {!wallet && (
              <button 
                onClick={() => { connectWallet(); closeMobile(); }}
                className="w-full flex justify-center items-center gap-3 px-6 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_4px_20px_rgba(6,182,212,0.3)] active:scale-95 transition-all"
              >
                <Wallet size={24} /> Connect Wallet
              </button>
            )}

            {user ? (
               <button onClick={handleLogout} className="w-full text-red-500 font-bold text-lg flex justify-center items-center gap-2 py-4 rounded-2xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 active:scale-95 transition-all">
                 <LogOut size={24} /> Logout
               </button>
            ) : (
               <div className="grid grid-cols-2 gap-4">
                 <Link href="/login" onClick={closeMobile} className="w-full flex justify-center items-center py-4 rounded-2xl font-bold text-lg text-white border border-white/10 bg-white/5 active:scale-95 transition-all">Log In</Link>
                 <Link href="/register" onClick={closeMobile} className="w-full flex justify-center items-center py-4 rounded-2xl font-bold text-lg bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 transition-all">Sign Up</Link>
               </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}