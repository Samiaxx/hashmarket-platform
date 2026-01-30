// client/lib/api.js

// Works on Vercel + Local
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://hashmarket-backend.onrender.com";

export default API_URL;
