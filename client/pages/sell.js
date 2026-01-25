import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Sell() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "digital",
    imageUrl: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      router.push("/login");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "https://hashmarket-platform.vercel.app/api/listings",
        formData,
        { headers: { "x-auth-token": token } }
      );

      alert("Listing submitted! It will be reviewed shortly.");
      router.push("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Error creating listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-[var(--brand-bg)] py-14 px-4">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Create a New Listing
            </h1>
            <p className="text-slate-500 mt-2">
              Share your product with buyers on HashMarket. All listings are
              reviewed to keep the marketplace safe.
            </p>
          </div>

          {/* Card */}
          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Listing Title
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Premium Landing Page Design"
                  onChange={handleChange}
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Price (USD)
                  </label>
                  <input
                    name="price"
                    type="number"
                    required
                    placeholder="49"
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Category
                  </label>
                  <select name="category" onChange={handleChange}>
                    <option value="digital">💻 Digital Product</option>
                    <option value="physical">📦 Physical Product</option>
                  </select>
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Cover Image (optional)
                </label>
                <input
                  name="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  onChange={handleChange}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Use a clear image that represents your product.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="4"
                  required
                  placeholder="Explain what buyers will receive, delivery details, and any requirements."
                  onChange={handleChange}
                />
              </div>

              {/* Submit */}
              <button
                disabled={loading}
                className="btn-primary w-full mt-4"
              >
                {loading ? "Submitting..." : "Submit for Review"}
              </button>

              {/* Trust note */}
              <p className="text-xs text-slate-400 text-center mt-3">
                Listings typically get reviewed within a few hours.
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
