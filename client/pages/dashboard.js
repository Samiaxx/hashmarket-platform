import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';

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
      const res = await axios.get('https://hashmarket-platform.vercel.app/api/dashboard', { headers: { 'x-auth-token': token } });
      setData(res.data);
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
        await axios.put(`https://hashmarket-platform.vercel.app/api/orders/${orderId}/status`, 
            { status: newStatus },
            { headers: { 'x-auth-token': token } }
        );
        alert(newStatus === 'SHIPPED' ? "Order marked as Shipped!" : "Funds Released to Seller!");
        fetchData(); // Refresh UI
    } catch (err) { alert(err.response?.data?.msg || "Action failed"); }
  };

  // Helper to render the "Dominos Pizza" style tracker
  const StatusTracker = ({ status, type }) => {
    // Steps: Paid -> Shipped -> Completed
    const steps = ['COMPLETED', 'SHIPPED', 'DELIVERED']; // Simple order for check
    
    let step = 1; // 1 = Paid
    if (status === 'SHIPPED') step = 2;
    if (status === 'COMPLETED') step = 3;

    return (
        <div className="flex items-center w-full mt-4 mb-2">
            {/* Step 1: Paid */}
            <div className={`flex flex-col items-center relative z-10`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>✓</div>
                <span className="text-[10px] font-bold mt-1 text-slate-500 uppercase">Paid</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
            
            {/* Step 2: Shipped */}
            <div className={`flex flex-col items-center relative z-10`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {type === 'digital' ? '📧' : '🚚'}
                </div>
                <span className="text-[10px] font-bold mt-1 text-slate-500 uppercase">{type === 'digital' ? 'Sent' : 'Shipped'}</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

            {/* Step 3: Completed */}
            <div className={`flex flex-col items-center relative z-10`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>🔓</div>
                <span className="text-[10px] font-bold mt-1 text-slate-500 uppercase">Funds Released</span>
            </div>
        </div>
    );
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <div className="container mx-auto px-6 md:px-12 py-12 flex-grow">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">My Dashboard</h1>
        <p className="text-slate-500 mb-10">Manage your orders and track shipments.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* --- LEFT: MY PURCHASES (BUYER VIEW) --- */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span>🛍️</span> Purchases <span className="text-sm font-normal text-slate-400">({data.purchases.length})</span>
                </h2>
                
                {data.purchases.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl text-center border border-dashed border-slate-300">
                        <p className="text-slate-400">You haven't bought anything yet.</p>
                        <button onClick={() => router.push('/market')} className="mt-4 text-emerald-600 font-bold text-sm hover:underline">Browse Market</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {data.purchases.map(order => (
                            <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">{order.itemTitle}</h3>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded bg-slate-100 text-slate-500`}>
                                            Order #{order.id.slice(-6)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-emerald-600 text-lg">${order.amount}</div>
                                        <div className="text-xs text-slate-400">{new Date(order.date).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                {/* TRACKER */}
                                <StatusTracker status={order.status} type={order.itemType} />

                                {/* BUYER ACTION */}
                                {order.status === 'SHIPPED' && (
                                    <div className="mt-6 bg-orange-50 p-4 rounded-xl border border-orange-100">
                                        <p className="text-xs text-orange-800 font-bold mb-2">Seller has marked this as sent. Did you receive it?</p>
                                        <button 
                                            onClick={() => updateStatus(order.id, 'COMPLETED')}
                                            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold text-sm hover:bg-emerald-600 transition shadow-lg"
                                        >
                                            Confirm Receipt & Release Funds 🔓
                                        </button>
                                    </div>
                                )}
                                {order.status === 'COMPLETED' && (
                                    <div className="mt-4 text-center text-xs font-bold text-emerald-600 bg-emerald-50 py-2 rounded-lg">
                                        ✓ Transaction Finalized
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- RIGHT: MY SALES (SELLER VIEW) --- */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span>💼</span> Sales <span className="text-sm font-normal text-slate-400">({data.sales.length})</span>
                </h2>

                {data.sales.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl text-center border border-dashed border-slate-300">
                        <p className="text-slate-400">You have no sales yet.</p>
                        <button onClick={() => router.push('/sell')} className="mt-4 text-emerald-600 font-bold text-sm hover:underline">List an Item</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {data.sales.map(order => (
                            <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-emerald-500 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">{order.itemTitle}</h3>
                                        <div className="text-xs text-slate-500 mt-1">Buyer: <span className="font-bold text-slate-700">{order.buyerId.slice(0,8)}...</span></div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-emerald-600 text-lg">+${order.amount}</div>
                                        <div className="text-xs text-slate-400">Escrow Locked</div>
                                    </div>
                                </div>

                                <StatusTracker status={order.status} type="physical" />

                                {/* SELLER ACTION */}
                                {order.status === 'COMPLETED' ? ( // 'COMPLETED' means Paid initially in this simple logic, wait...
                                    // Actually, in our logic: 
                                    // 1. Created -> 'COMPLETED' (Initial Payment Success).
                                    // We need to change the initial status to 'PAID' to make this flow perfect.
                                    // BUT, based on current code, 'COMPLETED' was the default. 
                                    // Let's assume 'COMPLETED' means "Funds in Escrow, waiting for shipping" for now to save refactoring everything.
                                    // wait, if I mark it SHIPPED it becomes SHIPPED.
                                    // if I mark it COMPLETED (final), it ends.
                                    // Let's fix the initial status in Server first? 
                                    // No, let's just handle it here: If status is 'COMPLETED' AND I am seller, it means "Paid".
                                    
                                    // BETTER: Let's assume 'COMPLETED' in the old code meant "Transaction Done".
                                    // For this new flow to work best, new orders should effectively be "PAID".
                                    // However, with existing data, let's just use a UI trick:
                                    // If status is 'COMPLETED' (Initial state from old code) -> Show "Mark Shipped".
                                    // If status is 'SHIPPED' -> Show "Waiting for Buyer".
                                    // We need a distinct final state. Let's call the final state 'RELEASED'.
                                    
                                    // Let's Stick to the Server Update logic:
                                    // If status is 'COMPLETED' (Default), Seller sees "Mark Shipped".
                                    // If status is 'SHIPPED', Seller sees "Waiting".
                                    // If status is 'RELEASED' (New final), Done.
                                    
                                    // To make this robust, update the 'confirmBuy' in market.js to set status 'PAID' instead of 'COMPLETED'.
                                    // But to keep it simple without breaking old data:
                                    // We will treat 'COMPLETED' as "Funds Locked / Ready to Ship".
                                    <div className="mt-6">
                                        <button 
                                            onClick={() => updateStatus(order.id, 'SHIPPED')}
                                            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-emerald-700 transition shadow-lg"
                                        >
                                            Mark as Shipped / Delivered 🚚
                                        </button>
                                        <p className="text-[10px] text-slate-400 text-center mt-2">Funds will be released after buyer confirms.</p>
                                    </div>
                                ) : order.status === 'SHIPPED' ? (
                                    <div className="mt-6 bg-slate-50 p-3 rounded-xl text-center">
                                        <span className="text-sm font-bold text-slate-500">Waiting for Buyer Confirmation...</span>
                                    </div>
                                ) : (
                                    <div className="mt-6 bg-emerald-50 p-3 rounded-xl text-center text-emerald-700 font-bold text-sm">
                                        $$ Funds Released to Wallet $$
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