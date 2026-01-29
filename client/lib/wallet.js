import { ethers } from "ethers";

// --- 1. CONFIGURATION ---
export const CONTRACT_ADDRESS = "0x01386CE38384956BCd39DE2100Eb31AA842cE7f2"; // Your deployed contract

export const CONTRACT_ABI = [
  // Core Escrow Functions
  "function createOrder(uint256 orderId) external payable",
  "function confirmDelivery(uint256 orderId) external",
  "function refundBuyer(uint256 orderId) external",
  
  // View Functions
  "function getOrder(uint256 orderId) external view returns (address buyer, address seller, uint256 amount, uint8 state)",
  "function getBalance() external view returns (uint256)"
];

// --- 2. HELPER FUNCTIONS ---

// Check if wallet is connected and on the correct network (Sepolia)
export const checkWallet = async () => {
  if (!window.ethereum) {
    alert("MetaMask is not installed!");
    return false;
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  
  // Chain ID for Sepolia is 11155111. Change to 1 (Mainnet) or 137 (Polygon) for production.
  if (network.chainId !== 11155111n) { 
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Hex for 11155111
      });
      return true;
    } catch (err) {
      alert("Please switch your wallet network to Sepolia Testnet");
      return false;
    }
  }
  return true;
};

// Get a Read-Write Contract Instance (For making transactions)
export const getContractWithSigner = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};