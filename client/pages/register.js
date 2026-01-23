import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    role: 'buyer' 
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('https://hashmarket-platform.vercel.app/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/market');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500">Join the Hybrid Marketplace</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Username</label>
            <input name="username" required className="w-full border p-3 rounded-lg" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input name="email" type="email" required className="w-full border p-3 rounded-lg" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input name="password" type="password" required className="w-full border p-3 rounded-lg" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Account Type</label>
            <select name="role" className="w-full border p-3 rounded-lg bg-white" onChange={handleChange}>
              <option value="buyer">Buyer (I want to buy)</option>
              <option value="seller">Seller (I want to sell)</option>
            </select>
          </div>

          <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition">
            Create Account
          </button>
        </form>
        <p className="text-center mt-6 text-slate-600">
          Already have an account? <Link href="/login" className="text-emerald-600 font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}