import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';

export default function AdminPanel() {
  const [listings, setListings] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    try {
      const res = await axios.get('http://localhost:5000/api/admin/listings', {
        headers: { 'x-auth-token': token }
      });
      setListings(res.data);
    } catch (err) {
      console.error("Not an admin or error fetching");
      // Optional: Redirect if not admin
    }
  };

  const handleModerate = async (id, status) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/admin/moderate/${id}`, 
        { status }, 
        { headers: { 'x-auth-token': token } }
      );
      alert(`Item ${status}!`);
      fetchPending(); // Refresh list
    } catch (err) {
      alert("Action failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="container mx-auto p-10">
        <h1 className="text-3xl font-bold text-red-600 mb-6">👮‍♂️ Admin Moderation Queue</h1>
        
        {listings.length === 0 ? (
          <p className="text-slate-500">No items pending approval.</p>
        ) : (
          <div className="grid gap-4">
            {listings.map(item => (
              <div key={item._id} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xl">{item.title}</h3>
                  <p className="text-slate-500">{item.description}</p>
                  <p className="text-emerald-600 font-bold">${item.price}</p>
                  <p className="text-xs text-slate-400">Seller: {item.seller.username}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleModerate(item._id, 'APPROVED')} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Approve</button>
                  <button onClick={() => handleModerate(item._id, 'REJECTED')} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}