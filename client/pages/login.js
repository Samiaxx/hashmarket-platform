import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ethers } from 'ethers'; // Make sure to npm install ethers on client too
import API_URL from '../lib/api';

export default function Login() {
  const router = useRouter();
  
  // --- STATE ---
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);      // General Loading
  const [walletLoading, setWalletLoading] = useState(false); // Wallet Specific Loading
  const [emailError, setEmailError] = useState(false); // Validation State

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (e.target.name === 'email') setEmailError(false);
  };

  // 4. REAL-TIME VALIDATION (OnBlur)
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      setEmailError(true);
      showToast("Please enter a valid email address", "error");
    }
  };

  // HELPER: Simple Toast Notification (Replace console.log for UX)
  const showToast = (msg, type = "success") => {
    // In a real app, use react-hot-toast. For now, we use the error state or alert.
    if (type === "error") setError(msg);
    else alert(msg); // Placeholder for success toast
  };

  // 1. METAMASK LOGIN LOGIC
  const handleWalletLogin = async () => {
    if (!window.ethereum) return showToast("Please install MetaMask!", "error");
    
    setWalletLoading(true);
    setError('');

    try {
      // A. Connect Wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // B. Create Message
      const message = `Login to HashMarket\nTimestamp: ${Date.now()}`;

      // C. Request Signature
      const signature = await signer.signMessage(message);

      // D. Verify on Backend
      const res = await fetch(`${API_URL}/api/auth/metamask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, message }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Wallet login failed");

      // Success
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');

    } catch (err) {
      console.error(err);
      showToast("Wallet connection denied or failed.", "error");
    } finally {
      setWalletLoading(false);
    }
  };

  // STANDARD LOGIN LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Effects... (Keep your existing background code here) */}

      <Link href="/" className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition z-20">← Return to Home</Link>

      <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Enter your details to access your account.</p>
        </div>

        {/* 3. INTELLIGENT ERROR FEEDBACK */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center font-medium animate-pulse flex items-center justify-center gap-2">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={validateEmail} // <--- Trigger validation when user leaves field
              placeholder="you@example.com"
              className={`w-full bg-slate-950 border ${emailError ? 'border-red-500 focus:border-red-500' : 'border-slate-800 focus:border-blue-500'} text-white px-4 py-3 rounded-xl outline-none transition placeholder-slate-600`}
            />
            {emailError && <p className="text-red-500 text-xs mt-1">Please enter a valid email address.</p>}
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white px-4 py-3 rounded-xl outline-none transition placeholder-slate-600"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[38px] text-slate-500 hover:text-white transition">
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white transition">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500" />
              Remember Me
            </label>
            <Link href="/forgot-password" className="text-blue-500 hover:text-blue-400 font-bold">Forgot Password?</Link>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {/* 2. LOADING SPINNER */}
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verifying...</span>
              </>
            ) : "Sign In"}
          </button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <div className="h-px bg-slate-800 flex-grow"></div>
          <span className="text-slate-500 text-xs font-bold uppercase">Or continue with</span>
          <div className="h-px bg-slate-800 flex-grow"></div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button 
            onClick={handleWalletLogin}
            disabled={walletLoading}
            className="flex items-center justify-center gap-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold transition group disabled:opacity-50"
          >
            {walletLoading ? (
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : (
               <>
                 <span className="text-xl group-hover:scale-110 transition">🦊</span>
                 <span>Login with MetaMask</span>
               </>
            )}
          </button>
          
          {/* Social buttons placeholder - Requires Google Client ID setup to fully implement */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 transition font-medium">Google</button>
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 transition font-medium">Apple</button>
          </div>
        </div>

        <div className="mt-8 text-center text-slate-500 text-sm">
          Don't have an account? <Link href="/register" className="text-emerald-500 font-bold hover:underline">Register Now</Link>
        </div>

      </div>
    </div>
  );
}