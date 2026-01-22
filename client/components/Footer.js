import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800 mt-auto z-10 relative">
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Section */}
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img src="/logo.png" alt="HashMarket" className="w-full h-full object-cover" />
             </div>
             <span>Hash<span className="text-emerald-500">Market</span></span>
          </Link>
          <p className="mt-4 text-slate-400 max-w-sm text-sm leading-relaxed">
            The world's first hybrid marketplace bridging the gap between physical assets and digital ownership. Secure, fast, and decentralized.
          </p>
          <div className="flex gap-4 mt-6">
            <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-emerald-500 hover:text-white transition">𝕏</span>
            <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-emerald-500 hover:text-white transition">📸</span>
            <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-emerald-500 hover:text-white transition">💬</span>
          </div>
        </div>

        {/* Links Section 1 */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Platform</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/market" className="hover:text-emerald-400 transition">Browse Market</Link></li>
            <li><Link href="/sell" className="hover:text-emerald-400 transition">Become a Seller</Link></li>
            <li><Link href="/chat" className="hover:text-emerald-400 transition">Messages</Link></li>
            <li><Link href="/dashboard" className="hover:text-emerald-400 transition">My Dashboard</Link></li>
          </ul>
        </div>

        {/* Links Section 2 */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Support</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><span className="hover:text-emerald-400 transition cursor-pointer">Help Center</span></li>
            <li><span className="hover:text-emerald-400 transition cursor-pointer">API Documentation</span></li>
            <li><span className="hover:text-emerald-400 transition cursor-pointer">Terms of Service</span></li>
            <li><span className="hover:text-emerald-400 transition cursor-pointer">Privacy Policy</span></li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-6 md:px-12 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        &copy; 2026 HashMarket Inc. All rights reserved. Built with Next.js, Node & MongoDB.
      </div>
    </footer>
  );
}