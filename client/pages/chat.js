import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MessageSquare } from 'lucide-react'; // Make sure to import this icon

export default function Chat() {
  // --- STATE ---
  // 1. Initialize with EMPTY arrays, not mock data
  const [conversations, setConversations] = useState([]); 
  const [messages, setMessages] = useState([]);
  
  const [activeChat, setActiveChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);

  // --- EFFECT: Load Real Chats (Placeholder) ---
  useEffect(() => {
    // In the future, this is where you will fetch real chats:
    // fetch(`${API_URL}/api/chats`).then(...)
    
    // For now, we leave it empty so new users see "No Messages"
    setConversations([]);
  }, []);

  // --- HANDLERS ---
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    // Add message to UI
    const newMsg = { id: Date.now(), sender: "seller", text: messageInput, type: "text", time: "Now" };
    setMessages([...messages, newMsg]);
    setMessageInput("");
  };

  const handleCreateOffer = () => {
    setShowOfferModal(false);
    const offerMsg = { 
      id: Date.now(), 
      sender: "seller", 
      text: "I have created a custom offer.", 
      type: "offer", 
      price: "0.5 ETH", 
      days: "7 Days" 
    };
    setMessages([...messages, offerMsg]);
  };

  // Safe check for active user
  const activeUser = conversations.find(c => c.id === activeChat);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl h-[calc(100vh-80px)]">
        
        {/* --- EMPTY STATE (Show this if no conversations exist) --- */}
        {conversations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center bg-slate-900/50 border border-slate-800 rounded-2xl p-10 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <MessageSquare size={40} className="text-slate-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Messages Yet</h2>
            <p className="text-slate-400 max-w-md mb-8">
              Your inbox is empty. Browse the marketplace and click "Contact Seller" on a profile to start a conversation.
            </p>
            <a href="/market" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-900/20">
              Browse Market
            </a>
          </div>
        ) : (
          /* --- REAL CHAT UI (Only shows if you have conversations) --- */
          <div className="flex h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            
            {/* LEFT SIDEBAR */}
            <div className="w-1/3 border-r border-slate-800 flex flex-col hidden md:flex">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                 <input type="text" placeholder="Search inbox..." className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-sm focus:border-blue-500 outline-none transition"/>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.map((chat) => (
                  <div key={chat.id} onClick={() => setActiveChat(chat.id)} className={`p-4 cursor-pointer transition border-l-4 ${activeChat === chat.id ? 'bg-slate-800 border-blue-500' : 'border-transparent hover:bg-slate-800/50'}`}>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-sm text-white">{chat.user}</span>
                      <span className="text-xs text-slate-500">{chat.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{chat.lastMsg}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT CHAT AREA */}
            <div className="w-full md:w-2/3 flex flex-col bg-slate-950 relative">
              {activeUser ? (
                <>
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <h3 className="font-bold text-white">{activeUser.user}</h3>
                    <button onClick={() => setShowOfferModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm">Create Offer</button>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-950/50">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === "seller" ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-md p-3 rounded-2xl text-sm ${msg.sender === "seller" ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                           {msg.text}
                         </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900 flex gap-3">
                    <input value={messageInput} onChange={(e) => setMessageInput(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none" placeholder="Type a message..."/>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm">Send</button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500">Select a conversation</div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}