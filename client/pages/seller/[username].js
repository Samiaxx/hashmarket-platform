import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function SellerProfile() {
  const { username } = useRouter().query;

  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    const load = async () => {
      try {
        const sellerRes = await axios.get(
          `https://hashmarket-platform.vercel.app/api/sellers/${username}`
        );
        const listingsRes = await axios.get(
          `https://hashmarket-platform.vercel.app/api/listings?seller=${username}`
        );
        const reviewsRes = await axios.get(
          `https://hashmarket-platform.vercel.app/api/reviews/${username}`
        );

        setSeller(sellerRes.data);
        setListings(listingsRes.data || []);
        setReviews(reviewsRes.data || []);
      } catch {
        setSeller(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [username]);

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!seller) return <div className="p-20 text-center">Seller not found</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* PROFILE */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto p-8 flex gap-6">
          <img
            src={seller.avatar || "/avatar-placeholder.png"}
            className="w-28 h-28 rounded-full"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{seller.username}</h1>
            <p className="text-slate-500 mt-1">
              {seller.location || "Worldwide"}
            </p>
            <p className="mt-3 text-slate-600">{seller.bio}</p>
            <p className="mt-2">
              ⭐ {seller.rating || "5.0"} ({seller.reviews} reviews)
            </p>
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <main className="flex-grow bg-[var(--brand-bg)] p-8">
        <h2 className="text-2xl font-bold mb-6">
          Listings by {seller.username}
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div key={item.id} className="card">
              <img
                src={item.image_url || "/placeholder.png"}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {item.description}
                </p>
                <p className="mt-2 font-bold text-indigo-600">
                  ${item.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* REVIEWS */}
        <section className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold mb-4">Reviews</h2>

          {reviews.length === 0 ? (
            <p className="text-slate-500">No reviews yet.</p>
          ) : (
            reviews.map((r, i) => (
              <div key={i} className="card p-4 mb-3">
                <div className="flex justify-between">
                  <strong>{r.users?.username}</strong>
                  <span>⭐ {r.rating}</span>
                </div>
                <p className="text-slate-600 mt-2">{r.comment}</p>
              </div>
            ))
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
