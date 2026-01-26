import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import API_URL from '../lib/api';

export default function SellerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    displayName: '', tagline: '', bio: '', profileImage: '',
    mainCategory: 'Development', skills: '', experienceLevel: 'Intermediate',
    github: '', linkedin: '', website: '',
    payoutWallet: ''
  });

  // --- HANDLERS ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    // Format data for backend
    const payload = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()), // Turn CSV string to array
      socialLinks: { github: formData.github, linkedin: formData.linkedin, website: formData.website }
    };

    try {
      const res = await fetch(`${API_URL}/api/seller/onboard`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Update local user role just in case
        const user = JSON.parse(localStorage.getItem('user'));
        user.role = 'seller';
        localStorage.setItem('user', JSON.stringify(user));
        
        router.push('/dashboard');
      } else {
        alert("Failed to save profile. Please try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER STEPS ---
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        
        {/* PROGRESS BAR */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Become a Seller</h1>
          <p className="text-slate-400 mb-6">Complete your professional profile to start selling.</p>
          <div className="flex items-center gap-2">
             {[1, 2, 3, 4].map(num => (
               <div key={num} className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= num ? 'bg-blue-600' : 'bg-slate-800'}`}></div>
             ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2 font-bold uppercase tracking-wider">
             <span>Identity</span>
             <span>Skills</span>
             <span>Social Proof</span>
             <span>Payment</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span> 
                Personal Identity
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Display Name</label>
                  <input name="displayName" value={formData.displayName} onChange={handleChange} placeholder="CryptoDev_Alex" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">One-Line Tagline</label>
                  <input name="tagline" value={formData.tagline} onChange={handleChange} placeholder="Senior Blockchain Developer" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                   Bio / Description 
                   <span className="ml-2 text-blue-500 cursor-pointer hover:underline text-[10px] bg-blue-500/10 px-2 py-1 rounded">✨ Rewrite with AI</span>
                </label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" placeholder="Tell us about your experience..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"></textarea>
                <p className="text-right text-xs text-slate-600 mt-1">{formData.bio.length}/600 chars</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Profile Image URL</label>
                <input name="profileImage" value={formData.profileImage} onChange={handleChange} placeholder="https://..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none" />
              </div>
            </div>
          )}

          {/* STEP 2: PROFESSIONAL INFO */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span> 
                Professional Info
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Main Category</label>
                    <select name="mainCategory" value={formData.mainCategory} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-slate-300">
                      <option>Development</option>
                      <option>Design</option>
                      <option>Writing</option>
                      <option>Marketing</option>
                      <option>Physical Assets</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Experience Level</label>
                    <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-slate-300">
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Expert</option>
                    </select>
                 </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Skills (Comma Separated)</label>
                <input name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Solidity, Figma, SEO..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none" />
                
                {/* Visual Tags Preview */}
                <div className="flex flex-wrap gap-2 mt-3">
                   {formData.skills.split(',').filter(s => s).map((tag, i) => (
                     <span key={i} className="bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/20">{tag}</span>
                   ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SOCIAL PROOF */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span> 
                Portfolio & Socials
              </h2>
              <p className="text-sm text-slate-400">Since this is a hybrid marketplace, linking external profiles increases trust by 80%.</p>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">GitHub URL</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                   <span className="pl-4 text-slate-500">github.com/</span>
                   <input name="github" value={formData.github} onChange={handleChange} placeholder="username" className="w-full bg-transparent text-white px-2 py-3 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">LinkedIn URL</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                   <span className="pl-4 text-slate-500">linkedin.com/in/</span>
                   <input name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="username" className="w-full bg-transparent text-white px-2 py-3 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Personal Website</label>
                <input name="website" value={formData.website} onChange={handleChange} placeholder="https://myportfolio.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none" />
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT & SECURITY */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span> 
                Payment & Security
              </h2>

              <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 mb-6">
                <h3 className="font-bold text-emerald-400 mb-1">🔐 Crypto Native Payouts</h3>
                <p className="text-xs text-emerald-200">HashMarket does not hold your funds. Earnings are released directly to this wallet via Smart Contract.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Wallet Address (ETH/Polygon/BSC)</label>
                <input name="payoutWallet" value={formData.payoutWallet} onChange={handleChange} placeholder="0x..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-mono text-sm" />
              </div>

              <div className="flex items-start gap-3 mt-6">
                 <input type="checkbox" className="mt-1 w-4 h-4 rounded bg-slate-800 border-slate-700" />
                 <p className="text-xs text-slate-400 leading-relaxed">
                   I agree to the <span className="text-white underline">Seller Terms</span>. I understand that I must complete KYC verification before withdrawing amounts over $5,000 equivalent.
                 </p>
              </div>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="flex justify-between mt-10 pt-6 border-t border-slate-800">
            {step > 1 ? (
              <button onClick={prevStep} className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition font-bold">Back</button>
            ) : <div></div>}
            
            {step < 4 ? (
              <button onClick={nextStep} className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-500/20">Next Step →</button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                {loading ? 'Processing...' : 'Complete Onboarding ✅'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}