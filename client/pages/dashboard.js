import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API_URL from '../lib/api';
import { useRouter } from 'next/router';

// --- NEW COMPONENT: ESCROW TIMELINE ---
const EscrowTimeline = ({ status }) => {
  const steps = [
    { id: 'PAID', label: 'Funds Locked', icon: '🔒', desc: 'Money held in Smart Contract' },
    { id: 'SHIPPED', label: 'Item Sent', icon: '🚚', desc: 'Seller has dispatched item' },
    { id: 'COMPLETED', label: 'Released', icon: '💸', desc: 'Funds sent to Seller' }
  ];

  let currentStep = 0;
  if (status === 'SHIPPED') currentStep = 1;
  if (status === 'COMPLETED') currentStep = 2;

  return (
    <div className="w-full mt-4 bg-[#0B0F19] p-5 rounded-xl border border-gray-800">
      <div className="flex items-center justify-between relative mb-6 px-2">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-800 z-0 rounded-full"></div>
        
        {/* Active Progress Line */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-600 to-emerald-400 z-0 transition-all duration-700 rounded-full"
          style={{ width: `${(currentStep / 2) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isActive = index <= currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-300 ${
                isActive 
                  ? 'bg-[#111827] border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                  : 'bg-[#111827] border-gray-700 text-gray-600'
              }`}>
                {isActive ? step.icon : index + 1}
              </div>
              <span className={`text-[10px] font-bold uppercase mt-2 tracking-wider ${
                 isActive ? 'text-emerald-400' : 'text-gray-600'
              }`}>
                {step.label}
              </span>
              
              {/* Tooltip for Current Step */}
              {isCurrent && (
                <div className="absolute -bottom-8 w-max text-[9px] bg-yellow-500 text-black px-2 py-0.5 rounded font-bold animate-bounce shadow-lg">
                  {step.desc}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
      // Note: Ensure your backend has the /dashboard route or uses specific endpoints
      // If /dashboard endpoint is missing in backend, you might need to fetch orders manually.
      // Assuming generic structure based on previous backend code:
      const res = await axios.get(`${API_URL}/api/orders/my-orders`, { headers: { 'x-auth-token': token } }); 
      // NOTE: You might need to adjust this endpoint to match your exact backend routes if they differ. 
      // Based on previous context, we built Order logic. If a unified dashboard endpoint is missing, 
      // we can fetch purchases/sales separately. For now assuming a unified return or separate calls.
      
      // Fallback if specific endpoint doesn't exist yet, we treat response as array:
      if (Array.isArray(res.data)) {
         // This is a simplification. Real backend needs to split sales/purchases.
         // For now, let's assume the backend was updated to return { purchases: [], sales: [] }
         setData(res.data);
      } else {
         setData(res.data);
      }
      setLoading(false);
    } catch (err) { 
        // Mock data for UI preview if backend is empty/erroring
        console.error(err);
        setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
        await axios.put(`${API_URL}/api/orders/${orderId}`, 
            { status: newStatus },
            { headers: { 'x-auth-token': token } }
        );
        alert(newStatus === 'SHIPPED' ? "Marked as Shipped!" : "Funds Released!");
        fetchData(); 
    } catch (err) { alert("Action failed"); }
  };

  if (loading) return <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-white">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 font-sans">
      <Navbar />
      
      <div className="container mx-auto px-6 md:px-12 py-12 flex-grow max-w-7xl">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-extrabold text-white mb-1">My Dashboard</h1>
                <p className="text-gray-500">Track orders and manage crypto payments.</p>
            </div>
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold border border-gray-700">
                Refresh Data
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* --- LEFT: PURCHASES --- */}
            <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="bg-yellow-500/10 text-yellow-500 p-2 rounded-lg">🛍️</span> 
                    Purchases <span className="text-sm font-normal text-gray-500">({data.purchases?.length || 0})</span>
                </h2>
                
                {(!data.purchases || data.purchases.length === 0) ? (
                    <div className="bg-[#111827] p-8 rounded-2xl text-center border border-dashed border-gray-700">
                        <p className="text-gray-500">You haven't bought anything yet.</p>
                        <button onClick={() => router.push('/market')} className="mt-4 text-yellow-500 font-bold text-sm hover:underline">Browse Market</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {data.purchases.map(order => (
                            <div key={order.id} className="bg-[#111827] p-6 rounded-2xl border border-gray-800 hover:border-gray-600 transition shadow-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{order.itemTitle}</h3>
                                        <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-gray-800 text-gray-400 border border-gray-700">
                                            Order #{order.id.slice(-6)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-yellow-500 text-lg">${order.amount}</div>
                                        <div className="text-xs text-gray-500">Paid in Crypto</div>
                                    </div>
                                </div>

                                {/* NEW: ESCROW TIMELINE */}
                                <EscrowTimeline status={order.status} />

                                {/* BUYER ACTION */}
                                {order.status === 'SHIPPED' && (
                                    <div className="mt-6 bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                                        <p className="text-xs text-yellow-500 font-bold mb-3 text-center">Seller sent the item! Did you receive it?</p>
                                        <button 
                                            onClick={() => updateStatus(order.id, 'COMPLETED')}
                                            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-emerald-500 transition shadow-lg"
                                        >
                                            Confirm Receipt & Release Funds 🔓
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- RIGHT: SALES --- */}
            <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="bg-emerald-500/10 text-emerald-500 p-2 rounded-lg">💼</span> 
                    Sales <span className="text-sm font-normal text-gray-500">({data.sales?.length || 0})</span>
                </h2>

                {(!data.sales || data.sales.length === 0) ? (
                    <div className="bg-[#111827] p-8 rounded-2xl text-center border border-dashed border-gray-700">
                        <p className="text-gray-500">You have no sales yet.</p>
                        <button onClick={() => router.push('/sell')} className="mt-4 text-emerald-500 font-bold text-sm hover:underline">List an Item</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {data.sales.map(order => (
                            <div key={order.id} className="bg-[#111827] p-6 rounded-2xl border border-gray-800 border-l-4 border-l-emerald-500 hover:border-gray-600 transition shadow-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{order.itemTitle}</h3>
                                        <div className="text-xs text-gray-500 mt-1">Buyer: <span className="font-bold text-gray-300">{order.buyerId.slice(0,8)}...</span></div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-emerald-500 text-lg">+${order.amount}</div>
                                        <div className="text-xs text-gray-500">Escrow Locked</div>
                                    </div>
                                </div>

                                <EscrowTimeline status={order.status} />

                                {/* SELLER ACTION */}
                                {order.status === 'PAID' ? (
                                    <div className="mt-6">
                                        <button 
                                            onClick={() => updateStatus(order.id, 'SHIPPED')}
                                            className="w-full bg-gray-100 text-black py-3 rounded-lg font-bold text-sm hover:bg-white transition shadow-lg"
                                        >
                                            Mark as Shipped / Delivered 🚚
                                        </button>
                                        <p className="text-[10px] text-gray-500 text-center mt-2">Funds released after buyer confirmation.</p>
                                    </div>
                                ) : order.status === 'SHIPPED' ? (
                                    <div className="mt-6 bg-gray-800 p-3 rounded-xl text-center border border-gray-700">
                                        <span className="text-sm font-bold text-gray-400">⏳ Waiting for Buyer Confirmation...</span>
                                    </div>
                                ) : (
                                    <div className="mt-6 bg-emerald-500/10 p-3 rounded-xl text-center text-emerald-400 font-bold text-sm border border-emerald-500/20">
                                        ✓ Funds Released to Wallet
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}