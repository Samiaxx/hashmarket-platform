import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Camera, ChevronRight, ChevronLeft, Check, X, Wallet, Briefcase, ShieldCheck } from "lucide-react";
import API_URL from "../lib/api";

export default function SellerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // FORM STATE
  const [formData, setFormData] = useState({
    displayName: "",
    tagline: "",
    bio: "",
    occupation: "",
    skills: [], // Array of strings
    website: "",
    payoutWallet: ""
  });

  // LOCAL STATE FOR INTERACTIVE INPUTS
  const [skillInput, setSkillInput] = useState("");

  // LOAD USER DATA ON MOUNT
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      // Pre-fill wallet if they connected via MetaMask login
      if (user.wallet_address) {
        setFormData(prev => ({ ...prev, payoutWallet: user.wallet_address }));
      }
    } else {
      router.push("/login");
    }
  }, []);

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim() !== "") {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`${API_URL}/api/seller/onboard`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-auth-token": token 
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        // Update local user data
        const user = JSON.parse(localStorage.getItem("user"));
        user.role = "seller";
        localStorage.setItem("user", JSON.stringify(user));
        
        router.push("/dashboard");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center pt-10 px-4 font-sans">
      
      {/* --- PROGRESS BAR --- */}
      <div className="w-full max-w-3xl mb-10">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
          <span className={step >= 1 ? "text-cyan-400" : ""}>1. Personal Info</span>
          <span className={step >= 2 ? "text-cyan-400" : ""}>2. Professional</span>
          <span className={step >= 3 ? "text-cyan-400" : ""}>3. Linked Accounts</span>
        </div>
        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out" 
            style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
          />
        </div>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="w-full max-w-3xl bg-[#111827] border border-gray-800 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* --- STEP 1: PERSONAL INFO --- */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-black mb-2">Personal Info</h1>
            <p className="text-gray-400 mb-8">Tell us a bit about yourself. This information will appear on your public profile.</p>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Pic Placeholder */}
              <div className="shrink-0">
                 <div className="w-32 h-32 rounded-full bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-cyan-400 hover:text-cyan-400 transition group relative overflow-hidden">
                    <Camera className="w-8 h-8 text-gray-500 group-hover:text-cyan-400 transition" />
                    <div className="absolute bottom-0 w-full bg-black/60 text-[10px] text-center py-1">Upload</div>
                 </div>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Name *</label>
                  <input 
                    name="displayName" 
                    value={formData.displayName} 
                    onChange={handleChange}
                    placeholder="e.g. John Doe" 
                    className="w-full bg-[#0B0F19] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">One-Line Tagline *</label>
                  <input 
                    name="tagline" 
                    value={formData.tagline}
                    onChange={handleChange}
                    placeholder="e.g. Senior Blockchain Developer" 
                    className="w-full bg-[#0B0F19] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bio / Description *</label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4" 
                    placeholder="Share a little about your experience..." 
                    className="w-full bg-[#0B0F19] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none transition resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 2: PROFESSIONAL INFO --- */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-black mb-2">Professional Info</h1>
            <p className="text-gray-400 mb-8">What are your skills? Let buyers know what you are good at.</p>

            <div className="space-y-6">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Occupation</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
                    <select 
                      name="occupation" 
                      value={formData.occupation}
                      onChange={handleChange}
                      className="w-full bg-[#0B0F19] border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white focus:border-cyan-500 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select your role...</option>
                      <option value="developer">Developer / Programmer</option>
                      <option value="designer">Designer / Creative</option>
                      <option value="marketer">Digital Marketer</option>
                      <option value="writer">Writer / Translator</option>
                    </select>
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Skills (Press Enter to Add)</label>
                  <div className="w-full bg-[#0B0F19] border border-gray-700 rounded-lg px-4 py-3 flex flex-wrap gap-2 focus-within:border-cyan-500 transition">
                    {formData.skills.map((skill, index) => (
                      <span key={index} className="bg-cyan-500/10 text-cyan-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        {skill}
                        <button onClick={() => removeSkill(skill)}><X size={12} className="hover:text-white" /></button>
                      </span>
                    ))}
                    <input 
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={addSkill}
                      placeholder={formData.skills.length === 0 ? "e.g. React, Solidity, Photoshop" : ""} 
                      className="bg-transparent outline-none flex-grow min-w-[120px] text-white"
                    />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Personal Website (Optional)</label>
                  <input 
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://" 
                    className="w-full bg-[#0B0F19] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none transition"
                  />
               </div>
            </div>
          </div>
        )}

        {/* --- STEP 3: PAYOUT & SECURITY --- */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-black mb-2">Get Paid</h1>
            <p className="text-gray-400 mb-8">Connect your wallet to receive instant crypto payouts when you complete jobs.</p>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <Wallet className="text-cyan-400 w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="font-bold text-lg">Crypto Wallet</h3>
                   <p className="text-sm text-gray-400">Recommended for instant payouts</p>
                 </div>
               </div>
               
               <input 
                  name="payoutWallet"
                  value={formData.payoutWallet}
                  onChange={handleChange}
                  placeholder="0x..." 
                  className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white font-mono text-sm mb-2 focus:border-cyan-500 outline-none"
               />
               <p className="text-xs text-gray-500 flex items-center gap-1">
                 <ShieldCheck className="w-3 h-3 text-green-500" /> Your wallet is encrypted and stored securely.
               </p>
            </div>
          </div>
        )}

        {/* --- NAVIGATION BUTTONS --- */}
        <div className="flex justify-between mt-12 pt-6 border-t border-gray-800">
          {step > 1 ? (
             <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-white font-bold transition px-4 py-2">
               <ChevronLeft size={18} /> Back
             </button>
          ) : (
             <div></div> /* Spacer */
          )}

          {step < 3 ? (
             <button onClick={handleNext} className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition transform active:scale-95">
               Continue <ChevronRight size={18} />
             </button>
          ) : (
             <button 
               onClick={handleSubmit} 
               disabled={loading}
               className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition transform active:scale-95 disabled:opacity-50"
             >
               {loading ? "Launching..." : "Finish & Create Profile"} <Check size={18} />
             </button>
          )}
        </div>

      </div>
    </div>
  );
}