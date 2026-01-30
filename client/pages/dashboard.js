import { useEffect, useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { useRouter } from 'next/router'; // Import Router for Redirects
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API_URL from '../lib/api';
import { checkWallet, getContractWithSigner } from '../lib/wallet';
import { LayoutDashboard, ShoppingBag, Wallet, Loader2 } from 'lucide-react'; // Added Loader2

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState({ purchases: [], sales: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [processingId, setProcessingId] = useState(null);
  const [walletBalance, setWalletBalance] = useState("0.00");

  useEffect(() => {
    // 1. Run the Gatekeeper Check & Fetch Data
    const initDashboard = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) { 
        router.push('/login'); 
        return; 
      }

      const user = JSON.parse(userStr);

      // --- THE GATEKEEPER LOGIC ---
      // If user is a Seller, we must ensure they finished onboarding.
      if (user.role === 'seller') {
        try {
           // We fetch the latest user data to be sure (in case they just finished)
           // If you don't have a specific /api/users/:id route, ensure /api/dashboard returns this info
           // For now, we rely on the local storage or a fresh fetch if possible.
           
           // If the flag is missing or false, redirect immediately
           if (!user.onboardingCompleted) {
             console.log("Profile incomplete. Redirecting to wizard...");
             router.push('/seller-onboarding');
             return; // Stop loading dashboard
           }
        } catch (e) {
           console.error("Auth Check Failed", e);
        }
      }

      // If allowed, fetch Dashboard Data
      try {
        const res = await axios.get(`${API_URL}/api/dashboard`, { headers: { 'x-auth-token': token } }); 
        if (res.data) setData(res.data);
        await fetchWalletBalance();
      } catch (err) { 
        console.error(err); 
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, []);

  const fetchWalletBalance = async () => {
    if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
              const balance = await provider.getBalance(accounts[0].address);
              setWalletBalance(ethers.formatEther(balance).substring(0, 6)); // Format to 4 decimals
          }
        } catch (err) {
          console.error("Wallet Fetch Error", err);
        }
    }
  };

  // --- RELEASE FUNDS FUNCTION (ESCROW) ---
  const handleReleaseFunds = async (orderId, databaseId) => {
    const isReady = await checkWallet();
    if (!isReady) return;

    if (!confirm("Are you sure you have received the item? This will release funds to the seller.")) return;

    setProcessingId(databaseId);

    try {
        const contract = await getContractWithSigner();
        const solidityOrderId = BigInt('0x' + databaseId);
        
        const tx = await contract.confirmDelivery(solidityOrderId);
        await tx.wait();

        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/api/orders/${databaseId}/status`, 
            { status: 'COMPLETED' },
            { headers: { 'x-auth-token': token } }
        );
        
        alert("Funds Released Successfully!");
        // Reload page to refresh data
        router.reload();
    } catch (err) {
        console.error(err);
        alert("Failed to release funds on-chain.");
    } finally {
        setProcessingId(null);
    }
  };

  // --- RENDER CONTENT ---
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-[#111827] p-6 rounded-2xl border border-white/5 shadow-lg">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Wallet Balance</p>
                    <h3 className="text-3xl font-black text-white mt-2">{walletBalance} <span className="text-sm text-cyan-400">ETH</span></h3>
                </div>
                <div className="bg-[#111827] p-6 rounded-2xl border border-white/5 shadow-lg">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Orders</p>
                    <h3 className="text-3xl font-black text-white mt-2">{data.purchases.length + data.sales.length}</h3>
                </div>
                <div className="bg-[#111827] p-6 rounded-2xl border border-white/5 shadow-lg">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Action</p>
                    <h3 className="text-3xl font-black text-white mt-2">
                        {data.purchases.filter(o => o.status === 'PAID').length}
                    </h3>
                </div>
             </div>
          </div>
        );

      case 'orders':
        return (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-white mb-6">My Orders</h2>
            {data.purchases.length === 0 && <p className="text-slate-500 italic">No orders found.</p>}
            <div className="space-y-4">
                {data.purchases.map(order => (
                    <div key={order.id} className="bg-[#111827] border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="font-bold text-lg text-white">{order.itemTitle}</h3>
                            <p className="text-xs text-slate-400 mt-1">Order ID: <span className="font-mono">{order.id.substring(0,8)}...</span></p>
                        </div>
                        
                        <div className="text-right">
                           <div className="font-mono text-cyan-400 font-bold text-xl mb-2">{order.amount} ETH</div>
                           
                           {order.status === 'SHIPPED' || order.status === 'PAID' ? (
                                <button 
                                    onClick={() => handleReleaseFunds(order.id, order.id)}
                                    disabled={processingId === order.id}
                                    className={`px-6 py-2 rounded-xl font-bold text-sm transition ${
                                        processingId === order.id 
                                        ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    }`}
                                >
                                    {processingId === order.id ? 'Processing...' : 'Release Funds 🔓'}
                                </button>
                            ) : (
                                <span className="px-4 py-2 bg-slate-800 text-slate-500 font-bold rounded-lg text-xs border border-slate-700">
                                    {order.status}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="animate-in fade-in duration-300">
             <div className="bg-gradient-to-br from-indigo-900 to-[#0B0F19] rounded-3xl p-8 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                
                <h2 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Connected Wallet</h2>
                <div className="text-5xl font-black text-white mb-2">{walletBalance} <span className="text-lg text-slate-500">ETH</span></div>
                <p className="text-sm text-slate-500 mb-8 max-w-md">This balance reflects your connected MetaMask wallet. Funds released from escrow are transferred directly here.</p>
                
                <div className="flex gap-4 opacity-50 cursor-not-allowed">
                    <button className="px-8 py-3 bg-white/10 border border-white/10 text-white font-bold rounded-xl">Withdraw</button>
                    <button className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl">Deposit</button>
                </div>
                <p className="text-xs mt-4 text-slate-600 font-mono">* Marketplace handles transfers automatically via Smart Contract.</p>
             </div>
          </div>
        );

      default: return null;
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
            <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">Loading Dashboard...</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 font-sans">
      <Navbar />
      <div className="flex max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
        
        {/* SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 bg-[#111827]/50 p-6 sticky top-20 h-[calc(100vh-80px)]">
           <nav className="space-y-2">
             <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${activeTab === 'overview' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white'}`}><LayoutDashboard size={18}/> Overview</button>
             <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${activeTab === 'orders' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white'}`}><ShoppingBag size={18}/> My Orders</button>
             <button onClick={() => setActiveTab('wallet')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${activeTab === 'wallet' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white'}`}><Wallet size={18}/> Wallet</button>
           </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 lg:p-10">
            {renderContent()}
        </main>
      </div>
      <Footer />
    </div>
  );
}