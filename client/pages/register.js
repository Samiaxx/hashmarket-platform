import { useState } from "react";
import { useRouter } from "next/router";
import API_URL from "../lib/api";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "buyer",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

      if (!res.ok) {
        setError(data.msg || "Something went wrong");
        return;
      }

      router.push("/market");
    } catch {
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>Join HashMarket</h1>
        <p className="subtitle">
          Buy & sell digital products with confidence
        </p>

        {error && <p className="error">{error}</p>}

        {/* ROLE SELECTOR */}
        <div className="role-switch">
          <button
            className={form.role === "buyer" ? "active" : ""}
            onClick={() => setForm({ ...form, role: "buyer" })}
            type="button"
          >
            👤 I’m a Buyer
            <span>Shop products</span>
          </button>

          <button
            className={form.role === "seller" ? "active" : ""}
            onClick={() => setForm({ ...form, role: "seller" })}
            type="button"
          >
            🛍 I’m a Seller
            <span>Sell & earn</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="footer">
          Already have an account?{" "}
          <a href="/login">Sign in</a>
        </p>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f6f7fb;
        }

        .card {
          background: #fff;
          width: 100%;
          max-width: 440px;
          padding: 2.5rem;
          border-radius: 14px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
        }

        h1 {
          margin-bottom: 0.25rem;
        }

        .subtitle {
          color: #666;
          margin-bottom: 1.5rem;
        }

        .role-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .role-switch button {
          border: 1px solid #ddd;
          background: #fff;
          padding: 1rem;
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          font-weight: 600;
        }

        .role-switch span {
          display: block;
          font-size: 0.85rem;
          font-weight: 400;
          color: #666;
        }

        .role-switch .active {
          border-color: #4f46e5;
          background: #eef2ff;
        }

        form input {
          width: 100%;
          padding: 0.9rem;
          margin-bottom: 1rem;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        form button {
          width: 100%;
          padding: 0.9rem;
          border-radius: 10px;
          border: none;
          background: #4f46e5;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
        }

        .footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.9rem;
        }

        .footer a {
          color: #4f46e5;
          font-weight: 600;
        }

        .error {
          color: red;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}
