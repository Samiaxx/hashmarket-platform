// client/lib/api.js

// Base backend URL (Render)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  "https://hashmarket-backend.onrender.com";

// Helper: build full URL safely
const buildUrl = (path = "") => {
  // if user passes full url, return it
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // ensure path starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // most of your backend routes start with /api
  // so if path does not start with /api, we add it
  if (!cleanPath.startsWith("/api")) {
    return `${API_BASE_URL}/api${cleanPath}`;
  }

  return `${API_BASE_URL}${cleanPath}`;
};

// Main request helper
export const apiRequest = async (path, options = {}) => {
  const url = buildUrl(path);

  try {
    const res = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // read response safely
    const text = await res.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (err) {
      data = text;
    }

    if (!res.ok) {
      const message =
        (data && data.msg) ||
        (data && data.error) ||
        `Request failed (${res.status})`;

      throw new Error(message);
    }

    return data;
  } catch (err) {
    console.error("❌ API Request Error:", err.message, url);
    throw err;
  }
};

// Optional: export base URL
export default API_BASE_URL;
