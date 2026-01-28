import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Chat() {
  const [activeChat, setActiveChat] = useState(1);
  const [messageInput, setMessageInput] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  
  // --- MOCK DATA (Simulating DB) ---
  const conversations = [
    { id: 1, user: "CryptoKing_99", avatar: "👨‍💻", online: true, lastMsg: "I specialize in Solidity.", time: "2m", unread: 0, level: "Level 2 Seller" },
    { id: 2, user: "NFT_Designer_X", avatar: "🎨", online: false, lastMsg: "The artwork is ready for review.", time: "1h", unread: 2, level: "Top Rated" },
    { id: 3, user: "DevOps_Master", avatar: "🛠️", online: true, lastMsg: "Server deployment complete.", time: "1d", unread: 0, level: "New Seller" },
  ];

  const [messages, setMessages] = useState([
    { id: 1, sender: "buyer", text: "Hi, can you build a staking DApp for my token?", type: "text", time: "10:40 AM" },
    { id: 2, sender: "seller", text: "Yes, I specialize in Solidity and React. Do you have the whitepaper?", type: "text", time: "10:42 AM" },
    { id: 3, sender: "system", text: "🔒 Order #9021 Created: Waiting for Deposit", type: "event", time: "10:45 AM" },
    { id: 4, sender: "buyer", text: "Sending the deposit now.", type: "text", time: "10:46 AM" },
  ]);

  // --- HANDLERS ---
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    // Add message to UI (Optimistic update)
    const newMsg = { id: Date.now(), sender: "seller", text: messageInput, type: "text", time: "Now" };
    setMessages([...messages, newMsg]);
    setMessageInput("");
  };

  const handleCreateOffer = () => {
    setShowOfferModal(false);
    // Simulate creating a contract card in chat
    const offerMsg = { 
      id: Date.now(), 
      sender: "seller", 
      text: "I have created a custom offer for the Staking DApp Project.", 
      type: "offer", 
      price: "0.5 ETH", 
      days: "7 Days" 
    };
    setMessages([...messages, offerMsg]);
  };

  const activeUser = conversations.find(c => c.id === activeChat);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl h-[calc(100vh-80px)]">
        <div className="flex h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          
          {/* --- LEFT SIDEBAR (User List) --- */}
          <div className="w-1/3 border-r border-slate-800 flex flex-col hidden md:flex">
            
            {/* Search Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search inbox..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>
            
            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.map((chat) => (
                <div 
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`p-4 cursor-pointer transition border-l-4 ${activeChat === chat.id ? 'bg-slate-800 border-blue-500' : 'border-transparent hover:bg-slate-800/50'}`}
                >
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center gap-2">
                       <span className="text-xl bg-slate-700 w-8 h-8 flex items-center justify-center rounded-full">{chat.avatar}</span>
                       <span className={`font-bold text-sm ${activeChat === chat.id ? 'text-white' : 'text-slate-300'}`}>{chat.user}</span>
                       {chat.online && <span className="w-2 h-2 bg-emerald-500 rounded-full border border-slate-900"></span>}
                    </div>
                    <span className="text-xs text-slate-500">{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-400 truncate w-4/5">{chat.lastMsg}</p>
                    {chat.unread > 0 && <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{chat.unread}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- RIGHT CHAT AREA --- */}
          <div className="w-full md:w-2/3 flex flex-col bg-slate-950 relative">
            
            {/* 1. CHAT HEADER */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-xl border border-slate-700">
                  {activeUser.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    {activeUser.user} 
                    {activeUser.level === "Top Rated" && <span className="bg-yellow-500/10 text-yellow-500 text-[9px] px-1.5 py-0.5 rounded border border-yellow-500/20 uppercase">Top Rated</span>}
                  </h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    {activeUser.online ? <span className="text-emerald-400">● Online</span> : 'Last seen 1h ago'} | Local Time 10:42 PM
                  </span>
                </div>
              </div>
              
              {/* 2. CREATE OFFER BUTTON */}
              <button 
                onClick={() => setShowOfferModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-900/20 transition"
              >
                 <span>⚡</span> Create Custom Offer
              </button>
            </div>

            {/* 3. SAFETY BANNER */}
            <div className="bg-yellow-900/20 text-yellow-500 text-[11px] p-2 text-center border-b border-yellow-500/10 font-medium">
              ⚠️ For your safety, never share private keys or communicate outside of HashMarket. Payments outside escrow are not protected.
            </div>

            {/* 4. MESSAGES STREAM */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-950/50">
              {messages.map((msg) => {
                if (msg.type === "event") {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="bg-slate-800/50 text-slate-400 text-xs px-4 py-1.5 rounded-full border border-slate-700">
                        {msg.text}
                      </div>
                    </div>
                  );
                }
                
                if (msg.type === "offer") {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="bg-slate-800 border border-blue-500/30 rounded-2xl p-4 w-72 shadow-xl">
                         <h4 className="font-bold text-white mb-2 text-sm">📑 Custom Offer Created</h4>
                         <p className="text-slate-400 text-xs mb-4">{msg.text}</p>
                         <div className="flex justify-between items-center mb-4 text-sm font-mono bg-slate-900 p-2 rounded-lg">
                            <span className="text-emerald-400 font-bold">{msg.price}</span>
                            <span className="text-slate-500">⏳ {msg.days} Delivery</span>
                         </div>
                         <button className="w-full bg-slate-700 text-slate-400 text-xs font-bold py-2 rounded cursor-not-allowed opacity-70">Waiting for Buyer...</button>
                      </div>
                    </div>
                  )
                }

                const isMe = msg.sender === "seller";
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-md p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                       isMe 
                         ? 'bg-blue-600 text-white rounded-tr-none' 
                         : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                     }`}>
                       {msg.text}
                     </div>
                  </div>
                );
              })}
            </div>

            {/* 5. INPUT AREA */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900 flex gap-3 items-center">
              <button type="button" className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition">📎</button>
              <input 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none text-white placeholder-slate-500 transition"
                placeholder="Type your message..."
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition">
                Send
              </button>
            </form>

            {/* --- CUSTOM OFFER MODAL (Absolute Overlay) --- */}
            {showOfferModal && (
              <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                 <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                    <h3 className="text-xl font-bold text-white mb-4">Create Custom Offer</h3>
                    
                    <div className="space-y-4">
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">I will deliver</label>
                          <input placeholder="e.g. Smart Contract Development" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"/>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-xs font-bold text-slate-500 uppercase">Price (ETH)</label>
                             <input type="number" placeholder="0.5" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"/>
                          </div>
                          <div>
                             <label className="text-xs font-bold text-slate-500 uppercase">Delivery (Days)</label>
                             <input type="number" placeholder="7" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"/>
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                       <button onClick={() => setShowOfferModal(false)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-sm">Cancel</button>
                       <button onClick={handleCreateOffer} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 font-bold text-sm shadow-lg shadow-emerald-900/20">Send Offer</button>
                    </div>
                 </div>
              </div>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}