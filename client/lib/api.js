const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-backend.vercel.app" // CHANGE THIS
    : "http://localhost:5000";

export default API_URL;
