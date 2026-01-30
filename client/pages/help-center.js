import { useState } from "react";
import Navbar from "../components/Navbar";
import { Search, HelpCircle, Shield, DollarSign, User, Mail, ChevronDown, ChevronUp, Send } from "lucide-react";
import API_URL from "../lib/api";

export default function HelpCenter() {
  const [activeCategory, setActiveCategory] = useState("freelancers");
  const [openFaq, setOpenFaq] = useState(null);
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- CONTENT DATA ---
  const categories = [
    { id: "freelancers", label: "For Sellers", icon: <User size={20} /> },
    { id: "clients", label: "For Buyers", icon: <DollarSign size={20} /> },
    { id: "safety", label: "Trust & Safety", icon: <Shield size={20} /> },
  ];

  const faqs = {
    freelancers: [
      { q: "How do I create a seller profile?", a: "Go to your dashboard and click 'Become a Seller'. Complete the onboarding wizard to list your skills and connect your wallet." },
      { q: "When do I get paid?", a: "Payments are held in escrow and released instantly to your connected crypto wallet once the buyer approves the delivery." },
      { q: "What are the fees?", a: "HashMarket charges a flat 5% service fee on all completed orders to maintain the platform." }
    ],
    clients: [
      { q: "How do I buy a service?", a: "Browse the marketplace, select a gig, and pay using ETH, USDT, or USDC. Your funds are safe in escrow until you approve the work." },
      { q: "Can I cancel an order?", a: "Yes, you can request a cancellation through the Resolution Center if the seller has not started working." }
    ],
    safety: [
      { q: "Is my crypto safe?", a: "Yes. We use audited smart contracts for escrow. HashMarket never holds your private keys." },
      { q: "How do I report a user?", a: "Use the 'Report' flag on any profile or message to alert our Trust & Safety team immediately." }
    ]
  };

  // --- HANDLERS ---
  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    // Get token to identify who is sending the email
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please log in to contact support.");
        setSending(false);
        return;
    }

    try {
      const res = await fetch(`${API_URL}/api/support/contact`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "x-auth-token": token
        },
        body: JSON.stringify(contactForm)
      });

      if (res.ok) {
        setSuccess(true);
        setContactForm({ subject: "", message: "" });
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans">
      <Navbar />

      {/* HEADER SECTION */}
      <div className="bg-[#111827] border-b border-gray-800 py-16 px-6 text-center">
        <h1 className="text-4xl font-black mb-4">How can we help?</h1>
        <div className="max-w-2xl mx-auto relative">
           <Search className="absolute left-4 top-3.5 text-gray-500" />
           <input 
             placeholder="Search for answers (e.g., 'payouts', 'account')..." 
             className="w-full bg-[#0B0F19] border border-gray-700 rounded-full py-3 pl-12 pr-6 focus:border-cyan-500 outline-none transition"
           />
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        
        {/* CATEGORY TABS */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${
                activeCategory === cat.id 
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20" 
                  : "bg-[#111827] text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ ACCORDION */}
        <div className="space-y-4 mb-20">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          {faqs[activeCategory].map((item, index) => (
            <div key={index} className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full flex justify-between items-center p-5 text-left hover:bg-white/5 transition"
              >
                <span className="font-bold text-lg">{item.q}</span>
                {openFaq === index ? <ChevronUp className="text-cyan-400" /> : <ChevronDown className="text-gray-500" />}
              </button>
              
              {openFaq === index && (
                <div className="p-5 pt-0 text-gray-400 leading-relaxed border-t border-gray-800/50">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CONTACT FORM SECTION */}
        <div id="contact" className="bg-gradient-to-br from-gray-900 to-[#111827] border border-gray-800 rounded-2xl p-8 md:p-12 relative overflow-hidden">
           {/* Decorative Glow */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

           <div className="relative z-10 grid md:grid-cols-2 gap-12">
             <div>
                <h2 className="text-3xl font-black mb-4">Still need help?</h2>
                <p className="text-gray-400 mb-6">Our support team is available 24/7. Send us a message directly from your registered email address.</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                  <Mail className="text-cyan-400" size={18} />
                  <span>Support Email: hashmarketofficial@gmail.com</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                   <HelpCircle className="text-cyan-400" size={18} />
                   <span>Average Response Time: 2 Hours</span>
                </div>
             </div>

             {success ? (
               <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                    <Send className="text-emerald-400" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-emerald-200">We've received your request and will email you back shortly.</p>
                  <button onClick={() => setSuccess(false)} className="mt-6 text-sm underline text-gray-400 hover:text-white">Send another</button>
               </div>
             ) : (
               <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subject / Issue</label>
                    <input 
                      required
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      placeholder="e.g. Trouble withdrawing funds"
                      className="w-full bg-[#0B0F19] border border-gray-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Message</label>
                    <textarea 
                      required
                      rows="4"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      placeholder="Describe your issue in detail..."
                      className="w-full bg-[#0B0F19] border border-gray-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition resize-none"
                    />
                  </div>
                  <button disabled={sending} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2">
                    {sending ? "Sending..." : "Send Message"} <Send size={18} />
                  </button>
               </form>
             )}
           </div>
        </div>

      </div>
    </div>
  );
}