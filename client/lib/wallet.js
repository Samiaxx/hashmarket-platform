import { ethers } from "ethers";

// --- 1. CONFIGURATION ---

// Your Deployed Contract Address (The one you just provided)
export const CONTRACT_ADDRESS = "0x01386CE38384956BCd39DE2100Eb31AA842cE7f2";

// Your Contract ABI (Application Binary Interface)
// IMPORTANT: You must copy this from Remix -> "Compilation Details" -> "ABI"
// I have included a Standard Escrow Interface below as a placeholder.
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

// Connect to the Contract (Read-Only)
export const getContract = async (providerOrSigner) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
};

// Check if wallet is on the correct network (e.g., Sepolia)
export const checkNetwork = async (provider) => {
  const network = await provider.getNetwork();
  // Change 11155111 to your chain ID (e.g., 1 for Mainnet, 137 for Polygon)
  if (network.chainId !== 11155111n) { 
    alert("Please switch to the Sepolia Testnet");
    return false;
  }
  return true;
};