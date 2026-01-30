import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import API_URL from "../lib/api";

export default function Login() {
  const router = useRouter();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuthRedirect = (user) => {
    if (user.role === "seller") router.push("/seller-onboarding");
    else router.push("/dashboard");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      handleAuthRedirect(data.user);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]"></div>
      </div>

      <Link
        href="/"
        className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition z-20"
      >
        ← Return to Home
      </Link>

      <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">
            Enter your details to access your account.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white px-4 py-3 rounded-xl outline-none transition placeholder-slate-600"
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white px-4 py-3 rounded-xl outline-none transition placeholder-slate-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-slate-500 hover:text-white transition"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-4 rounded-xl transition transform hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-500 text-sm">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-emerald-500 font-bold hover:underline"
          >
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}
