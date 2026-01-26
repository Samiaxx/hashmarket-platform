import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import API_URL from "../lib/api";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "buyer",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Registration failed");

      router.push("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] relative overflow-hidden px-4 font-sans">
      
      {/* BACKGROUND GLOW EFFECTS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* LOGO HEADER */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group cursor-pointer no-underline">
            <div className="w-12 h-12 rounded-xl border border-gray-800 bg-[#111827] flex items-center justify-center shadow-lg group-hover:scale-105 transition">
              <img src="/logo.png" className="w-8 h-8 object-contain" alt="Logo" />
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h1>
          <p className="text-gray-400 mt-2 text-sm">Join the premier decentralized marketplace.</p>
        </div>

        {/* GLASS CARD */}
        <div className="p-8 rounded-2xl shadow-2xl border border-gray-800/50 backdrop-blur-xl bg-[#111827]/60 relative overflow-hidden">
          
          {/* Subtle top highlight */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-bold text-center">
              {error}
            </div>
          )}

          {/* ROLE SELECTOR (PREMIUM TOGGLE) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#050505] rounded-xl mb-6 border border-gray-800">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "buyer" })}
              className={`py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                form.role === "buyer"
                  ? "bg-gray-800 text-white shadow-lg border border-gray-700"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              🛍️ Buyer
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "seller" })}
              className={`py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                form.role === "seller"
                  ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              💼 Seller
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Username</label>
              <input
                name="username"
                required
                placeholder="CryptoKing"
                className="w-full bg-[#0B0F19] border border-gray-700 text-white placeholder-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full bg-[#0B0F19] border border-gray-700 text-white placeholder-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-[#0B0F19] border border-gray-700 text-white placeholder-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition"
                onChange={handleChange}
              />
            </div>

            <button
              disabled={loading}
              className="w-full py-4 mt-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg shadow-xl shadow-yellow-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-yellow-500 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
        
        {/* FOOTER LINKS */}
        <div className="text-center mt-8 text-xs text-gray-600 space-x-4">
          <Link href="#" className="hover:text-gray-400 transition no-underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="#" className="hover:text-gray-400 transition no-underline">Terms of Service</Link>
        </div>

      </div>
    </div>
  );
}