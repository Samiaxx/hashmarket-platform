import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from "../lib/api";

export default function Sell() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", price: "", category: "digital", imageUrl: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/listings`, formData, { headers: { "x-auth-token": token } });
      router.push("/market");
    } catch (err) {
      alert("Error listing item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white">Create New Listing</h1>
            <p className="text-gray-400 mt-2">Sell your assets securely for Crypto.</p>
          </div>

          <div className="glass-panel p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* TITLE */}
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Item Name</label>
                <input name="title" required placeholder="e.g. 3D Model Pack" className="input-field" onChange={handleChange} />
              </div>

              {/* ROW 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Price (USD)</label>
                  <input name="price" type="number" required placeholder="0.00" className="input-field" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Category</label>
                  <select name="category" className="input-field appearance-none cursor-pointer" onChange={handleChange}>
                    <option value="digital">💻 Digital Product</option>
                    <option value="physical">📦 Physical Good</option>
                    <option value="freelance">🤝 Freelance Service</option>
                  </select>
                </div>
              </div>

              {/* IMAGE URL */}
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Image URL (Optional)</label>
                <input name="imageUrl" placeholder="https://..." className="input-field" onChange={handleChange} />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Description</label>
                <textarea name="description" rows="4" required placeholder="Describe your item..." className="input-field resize-none" onChange={handleChange} />
              </div>

              {/* SUBMIT */}
              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
                {loading ? "Processing..." : "Publish Listing"}
              </button>
            </form>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}