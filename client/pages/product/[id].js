import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import API_URL from '../../lib/api';
import { checkWallet, getContractWithSigner, CONTRACT_ADDRESS } from '../../lib/wallet'; // Added CONTRACT_ADDRESS import

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/listings/${id}`);
      setItem(res.data);
    } catch (err) {
      console.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER: Display Earnings (LaborX Model) ---
  const calculateFees = (price) => {
    const numPrice = parseFloat(price);
    const fee = numPrice * 0.10; // 10% Platform Fee
    const sellerGets = numPrice - fee;
    return { 
      fee: fee.toFixed(4), 
      sellerGets: sellerGets.toFixed(4) 
    };
  };

  const handleBuy = async () => {
    const token = localStorage.getItem('token');
    if(!token) {
        router.push('/login');
        return;
    }

    // 1. Check Wallet & Network
    const isReady = await checkWallet();
    if (!isReady) return;

    setBuying(true);

    try {
      // 2. Prepare Contract Interface
      const contract = await getContractWithSigner();
      
      // 3. Convert Database ID to Numeric ID for Solidity
      const orderId = BigInt('0x' + item._id); 

      // 4. Send Transaction
      // IMPORTANT: We now pass the seller's address so the contract knows who to pay later.
      // Note: We assume the backend populated item.seller.wallet_address
      const sellerAddress = item.seller?.wallet_address || item.sellerWalletAddress;
      
      if (!sellerAddress) {
        throw new Error("Seller wallet address not found. Cannot proceed.");
      }

      const tx = await contract.createOrder(orderId, sellerAddress, { 
        value: ethers.parseEther(item.price.toString()) 
      });

      console.log("Transaction Sent:", tx.hash);
      await tx.wait(); // Wait for confirmation
      console.log("Transaction Confirmed");

      // 5. Save Order to Database
      await axios.post(`${API_URL}/api/orders`, {
        listingId: item._id,
        amount: item.price,
        txHash: tx.hash
      }, {
        headers: { 'x-auth-token': token }
      });

      alert("Purchase Successful! Funds are now in Escrow.");
      router.push('/dashboard');

    } catch (err) {
      console.error("Purchase failed:", err);
      alert(err.message || "Transaction failed or rejected.");
    } finally {
      setBuying(false);
    }
  };

  if (loading || !item) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  const fees = calculateFees(item.price);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2">
            
            {/* --- LEFT: IMAGE --- */}
            <div className="h-96 md:h-auto bg-gray-100 relative overflow-hidden rounded-l-2xl">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            </div>
            
            {/* --- RIGHT: DETAILS --- */}
            <div className="p-8 md:p-12 flex flex-col justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{item.title}</h1>
                    
                    {/* Trust Badges */}
                    <div className="flex items-center gap-2 mb-6">
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-200">
                           Verified Seller
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200">
                           Escrow Protected
                        </span>
                    </div>

                    <p className="text-gray-600 mb-8 leading-relaxed">{item.description}</p>
                </div>

                {/* Pricing Card */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-gray-500 text-sm font-medium">Total Price</span>
                        <span className="text-3xl font-black text-gray-900">{item.price} ETH</span>
                    </div>

                    {/* 0% FEE BADGE (LaborX Model) */}
                    <div className="flex justify-end mb-6">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                            ✨ 0% Buyer Fee Applied
                        </span>
                    </div>

                    <button 
                        onClick={handleBuy}
                        disabled={buying}
                        className={`w-full text-white font-bold text-lg py-4 rounded-lg transition shadow-lg ${
                            buying ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-gray-800 active:scale-95'
                        }`}
                    >
                        {buying ? "Processing Blockchain Tx..." : "Buy Now via Escrow"}
                    </button>
                    
                    {/* Transparency Note */}
                    <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                        <p className="text-xs text-gray-400">
                            Funds are secured in Smart Contract <span className="font-mono text-gray-500">{CONTRACT_ADDRESS.slice(0,6)}...</span>
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                            Seller receives <span className="font-bold text-gray-500">{fees.sellerGets} ETH</span> (10% Service Fee deducted)
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}