import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import API_URL from "../lib/api";
import Link from "next/link";

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.msg || "Verification failed.");
          return;
        }

        setStatus("success");
        setMessage(data.msg || "Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage("Server not reachable. Try again later.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] p-6">
      <div className="max-w-md w-full p-8 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl text-center">
        <h1 className="text-2xl font-black text-white mb-3">
          Email Verification
        </h1>

        <p
          className={`text-sm mb-6 ${
            status === "success"
              ? "text-green-400"
              : status === "error"
              ? "text-red-400"
              : "text-slate-400"
          }`}
        >
          {message}
        </p>

        {status === "success" && (
          <Link
            href="/login"
            className="btn-brand w-full py-4 inline-flex justify-center"
          >
            Go to Login
          </Link>
        )}

        {status === "error" && (
          <button
            onClick={() => router.push("/register")}
            className="btn-brand w-full py-4"
          >
            Back to Register
          </button>
        )}
      </div>
    </div>
  );
}
