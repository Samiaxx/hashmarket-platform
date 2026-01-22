import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Sell() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: 'physical', imageUrl: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) { alert("Please login first"); router.push('/login'); return; }

    try {
      await axios.post('http://localhost:5000/api/listings', formData, {
        headers: { 'x-auth-token': token }
      });
      alert("Item Listed! It is now PENDING approval.");
      router.push('/dashboard');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error listing item');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="container mx-auto p-6 md:p-12 flex-grow flex justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg border border-slate-100 h-fit">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">List New Asset</h1>
          <p className="text-slate-500 mb-6">Enter the details of the item you want to sell.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title</label>
              <input name="title" required placeholder="e.g. MacBook Pro M2" className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price ($)</label>
                <input name="price" type="number" required placeholder="1200.00" className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" onChange={handleChange} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                <select name="category" className="w-full border border-slate-200 p-3 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none" onChange={handleChange}>
                  <option value="physical">📦 Physical Good</option>
                  <option value="digital">💻 Digital Good</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Image URL (Optional)</label>
              <input name="imageUrl" placeholder="https://..." className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" onChange={handleChange} />
              <p className="text-[10px] text-slate-400 mt-1">Paste a link from Unsplash or Google Images.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
              <textarea name="description" required rows="4" placeholder="Describe condition, features, etc..." className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" onChange={handleChange}></textarea>
            </div>

            <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition shadow-lg">
              Submit for Verification
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}