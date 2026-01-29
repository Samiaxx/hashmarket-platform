import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers'; // Import ethers
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import API_URL from '../../lib/api';
import { checkWallet, getContractWithSigner } from '../../lib/wallet'; // Import our wallet helpers

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false); // State for transaction loading

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
      
      // 3. Convert Database ID to Numeric ID for Solidity (Handling Hex Strings)
      // We use the last 12 chars of the MongoID to fit in uint256 safely if needed, 
      // or simply hash it. Here we convert the hex string to BigInt.
      const orderId = BigInt('0x' + item._id); 

      // 4. Send Transaction (Deposit Funds)
      const tx = await contract.createOrder(orderId, { 
        value: ethers.parseEther(item.price.toString()) 
      });

      console.log("Transaction Sent:", tx.hash);
      await tx.wait(); // Wait for confirmation
      console.log("Transaction Confirmed");

      // 5. Save Order to Database with TX Hash
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
      alert("Transaction failed or rejected.");
    } finally {
      setBuying(false);
    }
  };

  if (loading || !item) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2">
            <div className="h-96 md:h-auto bg-gray-100 relative">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{item.title}</h1>
                    <p className="text-gray-600 mb-8">{item.description}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-3xl font-black text-gray-900">{item.price} ETH</span>
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
                    <p className="text-center text-xs text-gray-400 mt-3">
                        Funds are held in Smart Contract {CONTRACT_ADDRESS.slice(0,6)}...
                    </p>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}