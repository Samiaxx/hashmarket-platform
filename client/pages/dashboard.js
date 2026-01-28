import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API_URL from '../lib/api';
import { useRouter } from 'next/router';
import Link from 'next/link';

// --- SUB-COMPONENT: ESCROW TIMELINE ---
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
  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl flex items-center gap-4 hover:border-white/10 transition group">
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

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-mono">Loading Neural Interface...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar />
      
      <div className="flex max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
        
        {/* --- 1. SIDEBAR NAVIGATION --- */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-slate-900/30 backdrop-blur-md p-6 sticky top-20 h-[calc(100vh-80px)]">
           <div className="mb-8">
             <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Main Menu</h2>
             <nav className="space-y-2">
               <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-xl font-bold text-sm">
                 <span>📊</span> Overview
               </button>
               <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-medium text-sm transition">
                 <span>📦</span> My Orders
               </button>
               <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-medium text-sm transition">
                 <span>💼</span> My Listings
               </button>
               <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-medium text-sm transition">
                 <span>💳</span> Wallet
               </button>
             </nav>
           </div>
           
           <div className="mt-auto">
             <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 rounded-2xl relative overflow-hidden">
                <div className="relative z-10">
                   <h3 className="font-bold text-white mb-1">Go Pro</h3>
                   <p className="text-xs text-emerald-100 mb-3 opacity-80">0% fees on your next 5 sales.</p>
                   <button className="bg-white text-emerald-900 text-xs font-bold px-3 py-2 rounded-lg">Upgrade Now</button>
                </div>
                <div className="absolute -right-4 -bottom-4 text-6xl opacity-20 rotate-12">💎</div>
             </div>
           </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 p-6 lg:p-10">
           
           {/* HEADER */}
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 text-sm mt-1">Welcome back, Commander. Here is your portfolio status.</p>
              </div>
              <div className="flex gap-3">
                 <button onClick={fetchData} className="px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold hover:text-white transition">Refresh Data</button>
                 <Link href="/sell" className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 flex items-center gap-2">
                    <span>+</span> New Listing
                 </Link>
              </div>
           </div>

           {/* --- 2. STATS RIBBON --- */}
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              <StatCard label="Net Worth" value="$0.00" icon="💰" color="emerald" />
              <StatCard label="Total Earnings" value="$0.00" icon="📈" color="blue" />
              <StatCard label="Active Orders" value={data.purchases.length + data.sales.length} icon="⚡" color="yellow" />
              <StatCard label="Trust Score" value="100%" icon="🛡️" color="purple" />
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* --- LEFT: PURCHASES --- */}
              <section>
                 <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <span className="w-2 h-6 bg-yellow-500 rounded-full"></span>
                    Recent Purchases
                 </h2>

                 {(!data.purchases || data.purchases.length === 0) ? (
                    // PRO EMPTY STATE
                    <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center hover:border-slate-700 transition group cursor-pointer" onClick={() => router.push('/market')}>
                       <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition">🛍️</div>
                       <h3 className="text-white font-bold mb-1">Start Your Collection</h3>
                       <p className="text-slate-500 text-sm mb-4">You haven't purchased any items yet.</p>
                       <span className="text-yellow-500 text-sm font-bold hover:underline">Browse Marketplace →</span>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       {data.purchases.map(order => (
                          <div key={order.id} className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl hover:border-white/10 transition">
                             <div className="flex justify-between items-start mb-4">
                                <div>
                                   <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase">Buy</span>
                                      <span className="text-xs text-slate-500">#{order.id.slice(-6)}</span>
                                   </div>
                                   <h3 className="font-bold text-white">{order.itemTitle}</h3>
                                </div>
                                <div className="text-right">
                                   <div className="font-mono text-yellow-400 font-bold">${order.amount}</div>
                                   <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Escrow</div>
                                </div>
                             </div>
                             
                             <EscrowTimeline status={order.status} />

                             {order.status === 'SHIPPED' && (
                                <button 
                                  onClick={() => updateStatus(order.id, 'COMPLETED')}
                                  className="mt-4 w-full py-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:text-white transition"
                                >
                                  Confirm Receipt & Release Funds 🔓
                                </button>
                             )}
                          </div>
                       ))}
                    </div>
                 )}
              </section>

              {/* --- RIGHT: SALES --- */}
              <section>
                 <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                    Recent Sales
                 </h2>

                 {(!data.sales || data.sales.length === 0) ? (
                    // PRO EMPTY STATE
                    <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center hover:border-slate-700 transition group cursor-pointer" onClick={() => router.push('/sell')}>
                       <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition">🚀</div>
                       <h3 className="text-white font-bold mb-1">Launch Your Business</h3>
                       <p className="text-slate-500 text-sm mb-4">List your first service or asset today.</p>
                       <span className="text-blue-500 text-sm font-bold hover:underline">Create Listing →</span>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       {data.sales.map(order => (
                          <div key={order.id} className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl hover:border-white/10 transition">
                             <div className="flex justify-between items-start mb-4">
                                <div>
                                   <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-bold bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded uppercase border border-blue-500/20">Sale</span>
                                      <span className="text-xs text-slate-500">#{order.id.slice(-6)}</span>
                                   </div>
                                   <h3 className="font-bold text-white">{order.itemTitle}</h3>
                                </div>
                                <div className="text-right">
                                   <div className="font-mono text-emerald-400 font-bold">+${order.amount}</div>
                                   <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pending</div>
                                </div>
                             </div>

                             <EscrowTimeline status={order.status} />

                             <div className="mt-4">
                                {order.status === 'PAID' ? (
                                    <button 
                                        onClick={() => updateStatus(order.id, 'SHIPPED')}
                                        className="w-full py-3 bg-white text-black font-bold rounded-xl text-sm hover:bg-gray-200 transition shadow-lg"
                                    >
                                        Mark as Shipped 🚚
                                    </button>
                                ) : order.status === 'SHIPPED' ? (
                                    <div className="w-full py-3 bg-slate-800 text-slate-400 font-bold rounded-xl text-sm text-center border border-slate-700">
                                        ⏳ Awaiting Buyer Confirmation
                                    </div>
                                ) : (
                                    <div className="w-full py-3 bg-emerald-500/10 text-emerald-400 font-bold rounded-xl text-sm text-center border border-emerald-500/20">
                                        ✓ Funds Released
                                    </div>
                                )}
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </section>

           </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}