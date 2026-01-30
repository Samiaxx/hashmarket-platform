import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ethers } from 'ethers'; 
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import API_URL from '../lib/api';

const GOOGLE_CLIENT_ID = "1097072821368-63877sdog6sqjr8d3rlr9kvcd8hbbe1h.apps.googleusercontent.com";

export default function Login() {
  const router = useRouter();
  
  // --- STATE ---
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);

  // --- HELPER: HANDLE REDIRECT ---
  // Redirects Sellers to Onboarding, Buyers to Dashboard
  const handleAuthRedirect = (user) => {
     if (user.role === 'seller') {
         router.push('/seller-onboarding');
     } else {
         router.push('/dashboard');
     }
  };

  // --- REAL-TIME WALLET LISTENER ---
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          console.log("User switched account to:", accounts[0]);
        }
      });
    }
  }, []);

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // 1. REAL WALLET LOGIN
  const handleWalletLogin = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed! Please install it to continue.");
      return;
    }

    setWalletLoading(true);
    setError('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const message = `Login to HashMarket\nTimestamp: ${Date.now()}`;
      const signature = await signer.signMessage(message);

      const res = await fetch(`${API_URL}/api/auth/metamask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, message }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Wallet login failed");

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      handleAuthRedirect(data.user); // Redirect based on role

    } catch (err) {
      console.error("Connection Error:", err);
      if (err.code === 4001) { 
         setError("You rejected the connection request.");
      } else {
         setError("Wallet login failed. Please try again.");
      }
    } finally {
      setWalletLoading(false);
    }
  };

  // 2. GOOGLE LOGIN HANDLER
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const decoded = jwtDecode(token);
      
      const res = await fetch(`${API_URL}/api/auth/google-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: decoded.email, 
          name: decoded.name, 
          picture: decoded.picture,
          googleId: decoded.sub 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Google Login Failed");

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      handleAuthRedirect(data.user); // Redirect based on role

    } catch (err) {
      console.error(err);
      setError("Google Login Failed");
    }
  };

  const handleGoogleError = () => setError("Google Login Failed");

  // 3. EMAIL/PASSWORD LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      
      handleAuthRedirect(data.user); // Redirect based on role
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]"></div>
        </div>

        <Link href="/" className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition z-20">← Return to Home</Link>

        <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400">Enter your details to access your account.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center font-medium animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <input type="email" name="email" onChange={handleChange} placeholder="you@example.com" className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white px-4 py-3 rounded-xl outline-none transition placeholder-slate-600" />
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
              <input type={showPassword ? "text" : "password"} name="password" onChange={handleChange} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white px-4 py-3 rounded-xl outline-none transition placeholder-slate-600" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[38px] text-slate-500 hover:text-white transition">
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition transform hover:scale-[1.02] disabled:opacity-50">
              {loading ? "Verifying..." : "Sign In"}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-slate-800 flex-grow"></div>
            <span className="text-slate-500 text-xs font-bold uppercase">Or continue with</span>
            <div className="h-px bg-slate-800 flex-grow"></div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* REAL WALLET BUTTON */}
            <button 
              onClick={handleWalletLogin} 
              disabled={walletLoading} 
              className="flex items-center justify-center gap-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold transition group disabled:opacity-50"
            >
               {walletLoading ? (
                 <span className="animate-pulse">Connecting...</span>
               ) : (
                 <><span className="text-xl">🦊</span> Login with MetaMask</>
               )}
            </button>
            
            {/* GOOGLE BUTTON */}
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_blue"
                shape="pill"
                width="100%"
              />
            </div>
          </div>

          <div className="mt-8 text-center text-slate-500 text-sm">
            Don't have an account? <Link href="/register" className="text-emerald-500 font-bold hover:underline">Register Now</Link>
          </div>

        </div>
      </div>
    </GoogleOAuthProvider>
  );
}