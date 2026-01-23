// client/pages/admin/moderation.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';

export default function Moderation() {
  const [pendingListings, setPendingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch Pending Listings
  useEffect(() => {
    const fetchPending = async () => {
      const token = localStorage.getItem('token');
      // Simple check to see if user is logged in
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await axios.get('https://hashmarket-platform.vercel.app/api/admin/listings', {
          headers: { 'x-auth-token': token }
        });
        setPendingListings(res.data);
      } catch (err) {
        if (err.response && err.response.status === 403) {
          alert('Access Denied: Admins Only');
          router.push('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, [router]);

  const handleModeration = async (id, status) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `https://hashmarket-platform.vercel.app/api/admin/moderate/${id}`,
        { status },
        { headers: { 'x-auth-token': token } }
      );
      
      // Remove the processed item from the list visually
      setPendingListings((prev) => prev.filter((item) => item._id !== id));
      
      alert(`Listing ${status} successfully.`);
    } catch (err) {
      alert('Error updating listing status.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container mx-auto p-6 md:p-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Moderation Dashboard</h1>
          <p className="text-slate-500">Review and approve listings before they go live.</p>
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : pendingListings.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
            <h3 className="text-emerald-800 font-medium text-lg">All caught up!</h3>
            <p className="text-emerald-600">No pending listings to review.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingListings.map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* Item Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">PENDING</span>
                    <span className="text-slate-400 text-sm">|</span>
                    <span className="text-slate-500 text-sm font-medium uppercase">{item.category}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">{item.title}</h2>
                  <p className="text-slate-600 mt-1 mb-2 text-sm">{item.description}</p>
                  <div className="text-sm text-slate-500">
                    Seller: <span className="font-semibold text-slate-700">{item.seller?.username || 'Unknown'}</span> 
                    <span className="mx-2">•</span> 
                    Price: <span className="font-semibold text-emerald-600">${item.price}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => handleModeration(item._id, 'REJECTED')}
                    className="flex-1 md:flex-none px-6 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleModeration(item._id, 'APPROVED')}
                    className="flex-1 md:flex-none px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}