import { useEffect, useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers'; // Import ethers
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API_URL from '../lib/api';
import { checkWallet, getContractWithSigner } from '../lib/wallet'; // Import wallet helpers
import { useRouter } from 'next/router';
import { LayoutDashboard, ShoppingBag, Briefcase, Wallet } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState({ purchases: [], sales: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [processingId, setProcessingId] = useState(null); // Track which order is processing
  const [walletBalance, setWalletBalance] = useState("0.00");
  const router = useRouter();

  useEffect(() => {
    fetchData();
    fetchWalletBalance();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    try {
      const res = await axios.get(`${API_URL}/api/dashboard`, { headers: { 'x-auth-token': token } }); 
      if (res.data) setData(res.data);
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  const fetchWalletBalance = async () => {
    if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
            const balance = await provider.getBalance(accounts[0].address);
            setWalletBalance(ethers.formatEther(balance));
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
        // Use the same ID conversion logic as creation
        const solidityOrderId = BigInt('0x' + databaseId);
        
        const tx = await contract.confirmDelivery(solidityOrderId);
        await tx.wait();

        // Update DB
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/api/orders/${databaseId}/status`, 
            { status: 'COMPLETED' },
            { headers: { 'x-auth-token': token } }
        );
        
        alert("Funds Released Successfully!");
        fetchData(); // Refresh UI
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
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-slate-900 p-5 rounded-2xl border border-white/5">
                    <p className="text-slate-400 text-xs font-bold uppercase">Wallet Balance</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{walletBalance} ETH</h3>
                </div>
                <div className="bg-slate-900 p-5 rounded-2xl border border-white/5">
                    <p className="text-slate-400 text-xs font-bold uppercase">Active Orders</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{data.purchases.length + data.sales.length}</h3>
                </div>
             </div>
          </div>
        );

      case 'orders':
        return (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-white mb-6">My Orders</h2>
            <div className="space-y-4">
                {data.purchases.map(order => (
                    <div key={order.id} className="bg-slate-900/60 border border-white/5 p-6 rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white">{order.itemTitle}</h3>
                            <span className="font-mono text-yellow-400 font-bold">{order.amount} ETH</span>
                        </div>
                        
                        {order.status === 'SHIPPED' || order.status === 'PAID' ? (
                            <button 
                                onClick={() => handleReleaseFunds(order.id, order.id)}
                                disabled={processingId === order.id}
                                className={`w-full py-3 font-bold rounded-xl transition ${
                                    processingId === order.id 
                                    ? 'bg-gray-600 cursor-not-allowed' 
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                                }`}
                            >
                                {processingId === order.id ? 'Releasing Funds...' : 'Confirm Receipt & Release Funds 🔓'}
                            </button>
                        ) : (
                            <div className="w-full py-3 bg-slate-800 text-slate-500 font-bold rounded-xl text-center">
                                Order Completed
                            </div>
                        )}
                    </div>
                ))}
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="animate-in fade-in duration-300">
             <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 border border-indigo-500/30 shadow-2xl">
                <h2 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-2">Connected Wallet</h2>
                <div className="text-5xl font-black text-white mb-2">{walletBalance} <span className="text-lg text-slate-500">ETH</span></div>
                <p className="text-sm text-slate-500 mb-8">This is your personal MetaMask balance. Funds released from escrow appear here directly.</p>
                
                <div className="flex gap-4 opacity-50 cursor-not-allowed">
                    <button className="flex-1 bg-white text-indigo-900 font-bold py-3 rounded-xl">Withdraw</button>
                    <button className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl">Deposit</button>
                </div>
                <p className="text-xs text-center mt-3 text-slate-600">*Direct deposit/withdraw disabled. Use Marketplace to trade.</p>
             </div>
          </div>
        );

      default: return null;
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans">
      <Navbar />
      <div className="flex max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
        <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 bg-slate-900/30 p-6 sticky top-20 h-[calc(100vh-80px)]">
           <nav className="space-y-2">
             <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === 'overview' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400'}`}><LayoutDashboard size={18}/> Overview</button>
             <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === 'orders' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400'}`}><ShoppingBag size={18}/> My Orders</button>
             <button onClick={() => setActiveTab('wallet')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === 'wallet' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400'}`}><Wallet size={18}/> Wallet</button>
           </nav>
        </aside>
        <main className="flex-1 p-6 lg:p-10">{renderContent()}</main>
      </div>
      <Footer />
    </div>
  );
}