import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API_URL from '../lib/api';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  LayoutDashboard, ShoppingBag, Briefcase, Wallet, 
  Settings, ArrowUpRight, ArrowDownLeft, Clock 
} from 'lucide-react';

// --- SUB-COMPONENT: ESCROW TIMELINE (Visual Progress) ---
const EscrowTimeline = ({ status }) => {
  const steps = [
    { id: 'PAID', label: 'Locked', icon: '🔒' },
    { id: 'SHIPPED', label: 'Shipped', icon: '🚚' },
    { id: 'COMPLETED', label: 'Released', icon: '💸' }
  ];

  let currentStep = 0;
  if (status === 'SHIPPED') currentStep = 1;
  if (status === 'COMPLETED') currentStep = 2;

  return (
    <div className="w-full mt-4 bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
      <div className="flex items-center justify-between relative px-2">
        {/* Progress Bar Background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-white/10 z-0"></div>
        {/* Active Progress Bar */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 z-0 transition-all duration-700"
          style={{ width: `${(currentStep / 2) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isActive = index <= currentStep;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border transition-all duration-300 ${
                isActive 
                  ? 'bg-emerald-900/80 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                  : 'bg-slate-900 border-white/10 text-slate-600'
              }`}>
                {step.icon}
              </div>
              <span className={`text-[9px] font-bold uppercase mt-2 tracking-wider ${isActive ? 'text-emerald-400' : 'text-slate-600'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: STAT CARD ---
const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl flex items-center gap-4 hover:border-white/10 transition group hover:-translate-y-1 duration-300">
    <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">{label}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    </div>
  </div>
);

// --- MAIN DASHBOARD PAGE ---
export default function Dashboard() {
  const [data, setData] = useState({ purchases: [], sales: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // STATE TO SWITCH TABS
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    try {
      const res = await axios.get(`${API_URL}/api/dashboard`, { headers: { 'x-auth-token': token } }); 
      if (res.data) setData(res.data);
      setLoading(false);
    } catch (err) { 
        console.error(err);
        setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
        await axios.put(`${API_URL}/api/orders/${orderId}/status`, 
            { status: newStatus },
            { headers: { 'x-auth-token': token } }
        );
        fetchData(); 
    } catch (err) { alert("Action failed"); }
  };

  // --- TABS CONFIGURATION ---
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'orders', label: 'My Orders', icon: <ShoppingBag size={18} /> },
    { id: 'listings', label: 'My Listings', icon: <Briefcase size={18} /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet size={18} /> },
  ];

  // --- RENDER CONTENT BASED ON ACTIVE TAB ---
  const renderContent = () => {
    switch (activeTab) {
      // 1. OVERVIEW TAB
      case 'overview':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Stats Row */}
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                <StatCard label="Net Worth" value="$0.00" icon="💰" color="emerald" />
                <StatCard label="Total Earnings" value="$0.00" icon="📈" color="blue" />
                <StatCard label="Active Orders" value={data.purchases.length + data.sales.length} icon="⚡" color="yellow" />
                <StatCard label="Trust Score" value="100%" icon="🛡️" color="purple" />
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Recent Activity Section */}
                <section>
                   <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                      <span className="w-2 h-6 bg-yellow-500 rounded-full"></span>
                      Recent Activity
                   </h2>
                   {data.purchases.length === 0 && data.sales.length === 0 ? (
                      <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-10 text-center">
                         <div className="text-4xl mb-4">💤</div>
                         <h3 className="text-white font-bold">No activity yet</h3>
                         <p className="text-slate-500 text-sm mt-2">Your latest transactions will appear here.</p>
                      </div>
                   ) : (
                      <div className="space-y-4">
                        {/* Combine and show just the last 3 items */}
                        {[...data.purchases, ...data.sales].slice(0, 3).map(item => (
                            <div key={item.id} className="bg-slate-900/60 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${item.buyerId ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                        {item.buyerId ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-white">{item.itemTitle}</div>
                                        <div className="text-xs text-slate-500">{new Date().toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-white">${item.amount}</div>
                            </div>
                        ))}
                      </div>
                   )}
                </section>
             </div>
          </div>
        );

      // 2. MY ORDERS TAB
      case 'orders':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-white mb-6">My Purchase History</h2>
            {data.purchases.length === 0 ? (
                <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
                    <ShoppingBag size={48} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="text-white font-bold text-lg">No orders yet</h3>
                    <Link href="/market" className="text-blue-500 hover:text-blue-400 font-bold mt-2 inline-block">Browse Marketplace →</Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {data.purchases.map(order => (
                        <div key={order.id} className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:border-white/10 transition">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-white text-lg">{order.itemTitle}</h3>
                                    <p className="text-xs text-slate-400 mt-1">Order ID: #{order.id.slice(-8)}</p>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-yellow-400 font-bold text-xl">${order.amount}</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider bg-slate-800 px-2 py-1 rounded mt-1 inline-block">Escrow Secured</div>
                                </div>
                            </div>
                            <EscrowTimeline status={order.status} />
                            {order.status === 'SHIPPED' && (
                                <button onClick={() => updateStatus(order.id, 'COMPLETED')} className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-900/20">
                                    Confirm Receipt & Release Funds 🔓
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
          </div>
        );

      // 3. MY LISTINGS TAB
      case 'listings':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Active Listings</h2>
                <Link href="/sell" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition">
                    + New Listing
                </Link>
            </div>
            {data.sales.length === 0 ? (
                <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
                    <Briefcase size={48} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="text-white font-bold text-lg">No active sales</h3>
                    <p className="text-slate-500">Start your business on HashMarket today.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {data.sales.map(order => (
                        <div key={order.id} className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-6 rounded-2xl">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-white">{order.itemTitle}</h3>
                                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
                                    {order.status === 'COMPLETED' ? 'SOLD' : 'IN PROGRESS'}
                                </span>
                             </div>
                             <div className="flex items-center gap-4 text-sm text-slate-400">
                                 <span>Price: <strong className="text-white">${order.amount}</strong></span>
                                 <span>•</span>
                                 <span>Buyer: {order.buyerId.slice(0,6)}...</span>
                             </div>
                             
                             <div className="mt-6 pt-4 border-t border-white/5">
                                {order.status === 'PAID' ? (
                                    <button onClick={() => updateStatus(order.id, 'SHIPPED')} className="w-full py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition">
                                        Mark as Shipped 🚚
                                    </button>
                                ) : (
                                    <div className="w-full py-2 bg-slate-800 text-slate-400 text-center rounded-lg text-sm font-bold">
                                        {order.status === 'SHIPPED' ? 'Waiting for Buyer Confirmation...' : 'Funds Released to Wallet'}
                                    </div>
                                )}
                             </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        );

      // 4. WALLET TAB
      case 'wallet':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <h2 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-2">Total Balance</h2>
                <div className="text-5xl font-black text-white mb-8">$0.00 <span className="text-lg text-slate-500 font-medium">USD</span></div>

                <div className="flex gap-4">
                    <button className="flex-1 bg-white text-indigo-900 font-bold py-3 rounded-xl hover:bg-gray-100 transition shadow-lg">
                        Withdraw
                    </button>
                    <button className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 transition shadow-lg">
                        Deposit
                    </button>
                </div>
             </div>

             <div className="mt-8">
                <h3 className="font-bold text-white mb-4">Transaction History</h3>
                <div className="text-center py-10 text-slate-500 bg-slate-900/50 rounded-xl border border-white/5">
                    <Clock size={24} className="mx-auto mb-2 opacity-50"/>
                    No transactions found
                </div>
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-mono">Loading Neural Interface...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar />
      
      <div className="flex max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
        
        {/* --- 1. SIDEBAR NAVIGATION (Desktop) --- */}
        <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 bg-slate-900/30 backdrop-blur-md p-6 sticky top-20 h-[calc(100vh-80px)]">
           <div className="mb-8">
             <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Main Menu</h2>
             <nav className="space-y-2">
               {tabs.map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                     activeTab === tab.id 
                       ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                       : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                   }`}
                 >
                   {tab.icon}
                   {tab.label}
                 </button>
               ))}
             </nav>
           </div>
           
           <div className="mt-auto">
             <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-5 rounded-2xl relative overflow-hidden group cursor-pointer hover:shadow-emerald-900/50 hover:shadow-lg transition">
                <div className="relative z-10">
                   <h3 className="font-bold text-white mb-1">Go Pro</h3>
                   <p className="text-xs text-emerald-100 mb-3 opacity-80">0% fees on your next 5 sales.</p>
                   <button className="bg-white text-emerald-900 text-xs font-bold px-3 py-2 rounded-lg shadow-sm">Upgrade Now</button>
                </div>
                <div className="absolute -right-4 -bottom-4 text-6xl opacity-20 rotate-12 group-hover:rotate-0 transition duration-500">💎</div>
             </div>
           </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 p-6 lg:p-10 overflow-hidden">
           
           {/* HEADER */}
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                <p className="text-slate-400 text-sm mt-1">Welcome back, Commander. Status: <span className="text-emerald-400 font-mono">ONLINE</span></p>
              </div>
              <div className="flex gap-3">
                 <button onClick={fetchData} className="px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold hover:text-white transition active:scale-95">Refresh Data</button>
                 <Link href="/sell" className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 flex items-center gap-2 active:scale-95">
                    <span>+</span> New Listing
                 </Link>
              </div>
           </div>

           {/* --- MOBILE TABS (Visible only on smaller screens) --- */}
           <div className="lg:hidden flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
              {tabs.map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                     activeTab === tab.id 
                       ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
                       : 'bg-slate-800 text-slate-400 border border-slate-700'
                   }`}
                 >
                   {tab.label}
                 </button>
              ))}
           </div>

           {/* --- DYNAMIC CONTENT AREA --- */}
           {renderContent()}

        </main>
      </div>
      <Footer />
    </div>
  );
}