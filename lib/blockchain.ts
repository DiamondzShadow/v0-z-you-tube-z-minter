"use server"

import { ethers } from "ethers"

// Extended ABI for ERC20 token with hasClaimed function
const tokenABI = [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function hasClaimed(address wallet) external view returns (bool)", // Add this if your contract has it
]

// Mock transaction for development
function createMockTransaction(address: string) {
  return {
    hash: `0x${Array(64)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("")}`,
    wait: async () => ({ status: 1 }),
  }
}

// Check if a wallet has already claimed (contract level)
export async function hasWalletClaimed(walletAddress: string): Promise<boolean> {
  // For development or if environment variables are missing
  if (process.env.NODE_ENV !== "production" || !process.env.RPC_URL || !process.env.CONTRACT_ADDRESS) {
    // Simulate based on wallet address for testing
    return walletAddress.toLowerCase().endsWith("1") || walletAddress.toLowerCase().endsWith("3")
  }

  try {
    const rpcUrl = process.env.RPC_URL
    const contractAddress = process.env.CONTRACT_ADDRESS

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const contract = new ethers.Contract(contractAddress, tokenABI, provider)

    // Check if the contract has the hasClaimed function
    try {
      return await contract.hasClaimed(walletAddress)
    } catch (error) {
      // If the contract doesn't have this function, fall back to checking the balance
      const balance = await contract.balanceOf(walletAddress)
      return balance > 0
    }
  } catch (error) {
    console.error("Error checking if wallet has claimed:", error)
    return false
  }
}

export async function mintTokens(recipientAddress: string, amount: any) {
  // First, check if the wallet has already claimed at the contract level
  const hasClaimedOnChain = await hasWalletClaimed(recipientAddress)
  if (hasClaimedOnChain) {
    throw new Error("This wallet has already claimed tokens according to the smart contract.")
  }

  // For development or if environment variables are missing
  if (
    process.env.NODE_ENV !== "production" ||
    !process.env.PRIVATE_KEY ||
    !process.env.CONTRACT_ADDRESS ||
    !process.env.RPC_URL
  ) {
    console.log("Development mode: Using mock transaction")
    return createMockTransaction(recipientAddress)
  }

  try {
    const privateKey = process.env.PRIVATE_KEY
    const contractAddress = process.env.CONTRACT_ADDRESS
    const rpcUrl = process.env.RPC_URL

    // Connect to the blockchain using ethers v5 syntax
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const wallet = new ethers.Wallet(privateKey, provider)
    const contract = new ethers.Contract(contractAddress, tokenABI, wallet)

    // Mint tokens to the recipient
    const tx = await contract.mint(recipientAddress, amount)
    await tx.wait()

    return tx
  } catch (error) {
    console.error("Error minting tokens:", error)

    // For non-production environments, return a mock transaction on error
    if (process.env.NODE_ENV !== "production") {
      return createMockTransaction(recipientAddress)
    }

    throw error
  }
}

export async function getTokenBalance(address: string): Promise<string> {
  // For development or if environment variables are missing
  if (process.env.NODE_ENV !== "production" || !process.env.CONTRACT_ADDRESS || !process.env.RPC_URL) {
    return "250.0"
  }

  try {
    const contractAddress = process.env.CONTRACT_ADDRESS
    const rpcUrl = process.env.RPC_URL

    // Connect to the blockchain using ethers v5 syntax
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const contract = new ethers.Contract(contractAddress, tokenABI, provider)

    // Get token balance
    const balance = await contract.balanceOf(address)

    // Format the balance to a readable string
    return ethers.formatUnits(balance, 18)
  } catch (error) {
    console.error("Error getting token balance:", error)

    // For non-production environments, return a mock balance on error
    if (process.env.NODE_ENV !== "production") {
      return "250.0"
    }

    throw error
  }
}
