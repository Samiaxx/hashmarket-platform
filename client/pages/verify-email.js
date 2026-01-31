import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;

  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        setLoading(true);

        // IMPORTANT: this must exist in your .env.local (frontend)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const res = await fetch(`${apiUrl}/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setOk(false);
          setMessage(data?.msg || "Verification failed.");
          setLoading(false);
          return;
        }

        setOk(true);
        setMessage(data?.msg || "Email verified successfully!");
        setLoading(false);

        setTimeout(() => router.push("/login"), 2500);
      } catch (err) {
        setOk(false);
        setMessage("Something went wrong. Try again.");
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 520, padding: 24, borderRadius: 14, background: "#0b0b0b", color: "white" }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Verify Email</h1>

        {loading ? (
          <p>{message}</p>
        ) : ok ? (
          <>
            <p style={{ color: "#22c55e" }}>{message}</p>
            <p style={{ marginTop: 10, opacity: 0.8 }}>Redirecting to login...</p>
          </>
        ) : (
          <>
            <p style={{ color: "#ef4444" }}>{message}</p>
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <Link href="/register" style={{ padding: "10px 14px", borderRadius: 10, background: "#2563eb", color: "white", textDecoration: "none" }}>
                Register Again
              </Link>
              <Link href="/login" style={{ padding: "10px 14px", borderRadius: 10, background: "#333", color: "white", textDecoration: "none" }}>
                Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
