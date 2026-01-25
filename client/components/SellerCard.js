import Link from "next/link";

export default function SellerCard({ seller }) {
  return (
    <div className="card p-5 flex flex-col justify-between">
      {/* Top */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          <img
            src={seller.avatar || "/avatar-placeholder.png"}
            alt={seller.username}
            className="w-14 h-14 rounded-full object-cover"
          />
          {seller.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="font-semibold text-lg leading-tight">
            {seller.username}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <span className="badge-seller">Seller</span>
            <span className="text-sm text-slate-500">
              {seller.location || "Worldwide"}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2 text-sm">
            ⭐
            <span className="font-medium">
              {seller.rating || "5.0"}
            </span>
            <span className="text-slate-500">
              ({seller.reviews || 0} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-slate-600 mt-4 line-clamp-3">
        {seller.bio || "Professional seller delivering high-quality digital products."}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-center mt-4 text-sm">
        <div>
          <p className="font-semibold">{seller.sales || 0}</p>
          <p className="text-slate-500">Sales</p>
        </div>
        <div>
          <p className="font-semibold">{seller.products || 0}</p>
          <p className="text-slate-500">Products</p>
        </div>
        <div>
          <p className="font-semibold">{seller.responseTime || "1h"}</p>
          <p className="text-slate-500">Response</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/seller/${seller.username}`}
        className="btn-primary text-center mt-5"
      >
        View Profile
      </Link>
    </div>
  );
}
