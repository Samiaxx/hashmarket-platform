import { useEffect, useState } from "react";
import API_URL from "../lib/api";

export default function Market() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/listings`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setListings(data);
        } else {
          setListings([]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ padding: 20 }}>Loading market…</p>;
  }

  return (
    <div className="market">
      <h1>Market</h1>

      {listings.length === 0 && <p>No listings available.</p>}

      <div className="grid">
        {Array.isArray(listings) &&
          listings.map((item) => (
            <div key={item.id} className="card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <strong>${item.price}</strong>
            </div>
          ))}
      </div>

      <style jsx>{`
        .market {
          padding: 2rem;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
        }
        .card {
          border: 1px solid #ddd;
          padding: 1rem;
        }
      `}</style>
    </div>
  );
}
