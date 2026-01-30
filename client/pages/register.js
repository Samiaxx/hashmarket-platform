import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import API_URL from "../lib/api";

export default function Register() {
  const [step, setStep] = useState("register"); // register | sent
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "buyer",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server returned invalid response. Backend may be down.");
      }

      if (!res.ok) throw new Error(data.msg || "Registration failed");

      setStep("sent");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (step === "sent") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] p-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="glass-panel p-10 max-w-md w-full text-center animate-premium relative z-10 border border-white/5 bg-slate-900/60 backdrop-blur-xl rounded-3xl">
          <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <Mail className="w-10 h-10 text-cyan-400" />
          </div>

          <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
            Verify Your Email
          </h2>

          <p className="text-slate-400 mb-8 leading-relaxed">
            We've sent a secure activation link to <br />
            <span className="text-cyan-400 font-bold">{form.email}</span>. <br />
            Please click the link to activate your account.
          </p>

          <div className="space-y-4">
            <Link
              href="/login"
              className="btn-brand w-full py-4 flex items-center justify-center gap-2"
            >
              Go to Login <ArrowRight size={18} />
            </Link>

            <button
              onClick={() => setStep("register")}
              className="text-sm text-slate-500 hover:text-white transition underline underline-offset-4"
            >
              Entered the wrong email?
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] relative overflow-hidden px-4 font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 mb-4 group cursor-pointer no-underline"
          >
            <div className="w-12 h-12 rounded-xl border border-white/5 bg-[#111827] flex items-center justify-center shadow-lg group-hover:scale-105 transition">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-blue-500">
                H
              </span>
            </div>
          </Link>

          <h1 className="text-3xl font-black text-white tracking-tight">
            Join HashMarket
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Create an account to start trading assets.
          </p>
        </div>

        <div className="p-8 rounded-3xl shadow-2xl border border-white/5 backdrop-blur-xl bg-[#111827]/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold text-center">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/40 rounded-2xl mb-8 border border-white/5">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "buyer" })}
              className={`py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                form.role === "buyer"
                  ? "bg-slate-800 text-white shadow-lg border border-white/10"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Buyer
            </button>

            <button
              type="button"
              onClick={() => setForm({ ...form, role: "seller" })}
              className={`py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                form.role === "seller"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Seller
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Username
              </label>
              <input
                name="username"
                required
                placeholder="Ex: crypto_pro"
                className="input-field"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@email.com"
                className="input-field"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="input-field"
                onChange={handleChange}
              />
            </div>

            <button
              disabled={loading}
              className="btn-brand w-full py-4 mt-4 flex items-center justify-center gap-3"
            >
              {loading ? "Creating..." : "Create Account"}{" "}
              <ShieldCheck size={20} />
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-cyan-400 font-bold hover:text-cyan-300 transition"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
