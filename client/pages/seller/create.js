import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import API_URL from '../../lib/api'; // <--- IMPORT THIS

export default function CreateListing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'physical' 
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      // UPDATED: Now uses API_URL instead of hardcoded link
      await axios.post(`${API_URL}/api/listings`, formData, {
        headers: { 'x-auth-token': token }
      });
      alert('Success! Your listing is now PENDING admin approval.');
      router.push('/market'); 
    } catch (err) {
      console.error(err);
      alert('Error creating listing. Make sure you are a Seller.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container mx-auto max-w-2xl p-6 mt-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Create New Listing</h1>
            <p className="text-slate-500 mt-2">Fill in the details below. An admin will review it shortly.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Item Title</label>
              <input name="title" required className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Premium React Template" value={formData.title} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price ($)</label>
                <input name="price" type="number" required className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00" value={formData.price} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select name="category" className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white" value={formData.category} onChange={handleChange}>
                  <option value="physical">Physical Product</option>
                  <option value="digital">Digital Download</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea name="description" required rows="4" className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Describe your item in detail..." value={formData.description} onChange={handleChange} />
            </div>

            <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold text-lg text-white transition shadow-lg ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}