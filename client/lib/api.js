// client/lib/api.js

// This checks if we have a special Vercel variable. 
// If not, it uses your hardcoded Render Backend URL.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://hashmarket-backend.onrender.com";

export default API_URL;