// client/pages/index.js
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center max-w-3xl px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
            The Trusted Marketplace for <span className="text-indigo-600">Digital</span> & <span className="text-emerald-600">Physical</span> Goods
          </h1>
          <p className="text-xl text-slate-600 mb-10">
            A secure platform with human-moderated listings, escrow payments, and verified sellers. Buy with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/market" 
              className="px-8 py-4 bg-slate-900 text-white text-lg font-bold rounded-xl hover:bg-slate-800 transition shadow-xl"
            >
              Start Browsing
            </Link>
            <Link 
              href="/seller/create" 
              className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 text-lg font-bold rounded-xl hover:bg-slate-100 transition"
            >
              Become a Seller
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-8 text-center text-slate-500">
        &copy; {new Date().getFullYear()} HybridMarket. Secure & Moderated.
      </footer>
    </div>
  );
}