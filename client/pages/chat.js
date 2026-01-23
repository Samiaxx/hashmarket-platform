import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';

export default function Chat() {
  const router = useRouter();
  const { with: partnerId } = router.query; 
  
  const [inbox, setInbox] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [partnerName, setPartnerName] = useState('Chat');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Offer Logic States
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [sellerItems, setSellerItems] = useState([]);
  const [offerDetails, setOfferDetails] = useState({ listingId: '', price: '' });
  
  // Checkout Logic
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState(null);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    if (user) fetchInbox();
  }, []);

  useEffect(() => {
    if (partnerId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); 
      return () => clearInterval(interval);
    }
  }, [partnerId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchInbox = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('https://hashmarket-platform.vercel.app/api/inbox', { headers: { 'x-auth-token': token } });
      setInbox(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`https://hashmarket-platform.vercel.app/api/messages/${partnerId}`, { headers: { 'x-auth-token': token } });
      setMessages(res.data);
      const contact = inbox.find(c => c.userId === partnerId);
      if (contact) setPartnerName(contact.username);
    } catch (err) { console.error(err); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post('https://hashmarket-platform.vercel.app/api/messages', { toId: partnerId, text: newMessage, type: 'text' }, { headers: { 'x-auth-token': token } });
      setNewMessage('');
      fetchMessages();
    } catch (err) { alert("Failed to send"); }
  };

  // --- OFFER FUNCTIONS ---

  const openOfferModal = async () => {
    const token = localStorage.getItem('token');
    // Fetch items belonging to the partner (assuming partner is seller)
    try {
        const res = await axios.get(`https://hashmarket-platform.vercel.app/api/listings/seller/${partnerId}`, { headers: { 'x-auth-token': token } });
        setSellerItems(res.data);
        setShowOfferModal(true);
    } catch (err) { alert("Could not fetch seller items."); }
  };

  const sendOffer = async () => {
    const token = localStorage.getItem('token');
    const selectedProduct = sellerItems.find(i => i._id === offerDetails.listingId);
    
    if(!selectedProduct || !offerDetails.price) return alert("Select item and price");

    try {
      await axios.post('https://hashmarket-platform.vercel.app/api/messages', { 
          toId: partnerId, 
          text: `Sent an offer for ${selectedProduct.title}`, 
          type: 'offer',
          offerData: {
              listingId: selectedProduct._id,
              listingTitle: selectedProduct.title,
              price: offerDetails.price,
              status: 'pending'
          }
      }, { headers: { 'x-auth-token': token } });
      
      setShowOfferModal(false);
      fetchMessages();
    } catch (err) { alert("Failed to send offer"); }
  };

  const acceptOffer = async (msgId) => {
    const token = localStorage.getItem('token');
    try {
        await axios.put(`https://hashmarket-platform.vercel.app/api/messages/offer/${msgId}`, 
            { status: 'accepted' }, 
            { headers: { 'x-auth-token': token } }
        );
        alert("Offer Accepted! The buyer has been notified.");
        fetchMessages();
    } catch(err) { alert("Error accepting"); }
  };

  // --- CHECKOUT FUNCTIONS ---
  const handlePayNow = (offer) => {
      setCheckoutItem({
          _id: offer.listingId,
          title: offer.listingTitle,
          price: offer.price, // Use negotiated price
          isCustom: true
      });
      setShowCheckout(true);
  };

  const processPayment = async () => {
      // Simulate Payment
      setTimeout(async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.post('https://hashmarket-platform.vercel.app/api/orders', 
                { listingId: checkoutItem._id, customPrice: checkoutItem.price }, 
                { headers: { 'x-auth-token': token } }
            );
            alert("Payment Successful! Order Placed.");
            setShowCheckout(false);
            router.push('/dashboard');
        } catch(err) { alert("Payment Failed"); }
      }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6 flex-grow flex gap-6 h-[85vh]">
        
        {/* SIDEBAR */}
        <div className={`w-full md:w-1/3 bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col ${partnerId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-5 border-b border-slate-100 font-bold text-slate-700">Inbox</div>
          <div className="overflow-y-auto flex-1 p-2">
            {inbox.map(chat => (
              <div key={chat.userId} onClick={() => router.push(`/chat?with=${chat.userId}`)} className={`p-4 rounded-xl cursor-pointer hover:bg-slate-50 transition mb-1 ${partnerId === chat.userId ? 'bg-emerald-50 text-emerald-700' : ''}`}>
                <div className="font-bold">{chat.username}</div>
                <div className="text-xs text-slate-400">View conversation</div>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className={`flex-1 bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col overflow-hidden ${!partnerId ? 'hidden md:flex' : 'flex'}`}>
          {partnerId ? (
            <>
              {/* Header */}
              <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/chat')} className="md:hidden text-slate-400">←</button>
                    <h2 className="font-bold text-lg text-slate-800">{partnerName}</h2>
                </div>
                {/* MAKE OFFER BUTTON */}
                <button onClick={openOfferModal} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-700 transition flex items-center gap-1">
                    <span>⚡</span> Make Offer
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-4">
                {messages.map(msg => {
                  const isMe = msg.fromId === currentUser?.id;
                  const isSystem = msg.type === 'system';

                  if (isSystem) {
                      return (
                          <div key={msg.id} className="flex justify-center my-4">
                              <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold">{msg.text}</span>
                          </div>
                      );
                  }

                  if (msg.type === 'offer') {
                      return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-xs w-full p-4 rounded-2xl border-2 ${isMe ? 'bg-white border-slate-200' : 'bg-white border-emerald-500'}`}>
                                  <div className="text-xs font-bold uppercase text-slate-400 mb-2">Custom Offer</div>
                                  <h3 className="font-bold text-slate-800 text-lg">{msg.offerData.listingTitle}</h3>
                                  <div className="text-3xl font-black text-emerald-600 my-2">${msg.offerData.price}</div>
                                  
                                  {/* STATUS BADGE */}
                                  <div className={`text-center py-1 rounded text-xs font-bold uppercase mb-3 ${msg.offerData.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                      Status: {msg.offerData.status}
                                  </div>

                                  {/* SELLER ACTION: ACCEPT */}
                                  {!isMe && msg.offerData.status === 'pending' && (
                                      <button onClick={() => acceptOffer(msg.id)} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-emerald-700">
                                          Accept Offer
                                      </button>
                                  )}

                                  {/* BUYER ACTION: PAY NOW (If accepted) */}
                                  {isMe && msg.offerData.status === 'accepted' && (
                                      <button onClick={() => handlePayNow(msg.offerData)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-sm hover:bg-slate-800">
                                          Pay Now
                                      </button>
                                  )}
                              </div>
                          </div>
                      );
                  }

                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-3 px-4 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'}`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2">
                <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 border p-3 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition">Send</button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <span className="text-6xl mb-4">💬</span>
              <p>Select a conversation</p>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* CREATE OFFER MODAL */}
      {showOfferModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
                  <h3 className="font-bold text-xl mb-4">Make an Offer</h3>
                  
                  {sellerItems.length === 0 ? (
                      <p className="text-slate-500 text-sm mb-4">This user has no active listings.</p>
                  ) : (
                      <div className="space-y-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Item</label>
                              <select className="w-full border p-2 rounded-lg" onChange={(e) => setOfferDetails({...offerDetails, listingId: e.target.value})}>
                                  <option value="">-- Choose Product --</option>
                                  {sellerItems.map(i => <option key={i._id} value={i._id}>{i.title} (Listed: ${i.price})</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Offer Price ($)</label>
                              <input type="number" className="w-full border p-2 rounded-lg" placeholder="e.g. 450" onChange={(e) => setOfferDetails({...offerDetails, price: e.target.value})} />
                          </div>
                      </div>
                  )}

                  <div className="flex gap-2 mt-6">
                      <button onClick={() => setShowOfferModal(false)} className="flex-1 py-2 text-slate-500 font-bold">Cancel</button>
                      <button onClick={sendOffer} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold">Send Offer</button>
                  </div>
              </div>
          </div>
      )}

      {/* PAY NOW MODAL (Simplified for Negotiation) */}
      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-sm text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">💳</div>
                <h2 className="text-2xl font-extrabold text-slate-900">Confirm Payment</h2>
                <p className="text-slate-500 mt-2">Paying negotiated price for:</p>
                <p className="font-bold text-lg mt-1">{checkoutItem?.title}</p>
                <div className="text-4xl font-black text-emerald-600 my-6">${checkoutItem?.price}</div>
                
                <button onClick={processPayment} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition mb-3">
                    Confirm & Pay
                </button>
                <button onClick={() => setShowCheckout(false)} className="text-slate-400 font-bold text-sm">Cancel</button>
            </div>
        </div>
      )}
    </div>
  );
}