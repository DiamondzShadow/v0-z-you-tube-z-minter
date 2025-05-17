import { ethers } from "ethers"

// WalletConnect Project ID
const PROJECT_ID = "d67db65de9b00403e9d42a588c8a2132"

// Store the connected wallet address in localStorage
export function storeWalletConnection(address: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("connectedWallet", address)
  }
}

// Clear the stored wallet connection
export function clearWalletConnection() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("connectedWallet")
  }
}

// Get the stored wallet connection
export function getStoredWalletConnection(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("connectedWallet")
  }
  return null
}

// Check if the wallet is still connected
export async function checkWalletConnection(): Promise<{ address: string; provider: any } | null> {
  if (typeof window === "undefined") return null

  // First check localStorage
  const storedAddress = getStoredWalletConnection()
  if (!storedAddress) return null

  // Then check if the wallet is still available
  if (window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.listAccounts()

      // If accounts exist and the first one matches our stored address
      if (accounts.length > 0) {
        // Case insensitive comparison of ethereum addresses
        if (accounts[0].address.toLowerCase() === storedAddress.toLowerCase()) {
          return {
            address: accounts[0].address,
            provider,
          }
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error)
    }
  }

  // If we get here, the wallet is no longer connected
  clearWalletConnection()
  return null
}

// Connect to wallet
export async function connectWallet(): Promise<{ address: string; provider: any } | null> {
  if (typeof window === "undefined") {
    throw new Error("Cannot connect wallet in server-side rendering")
  }

  if (!window.ethereum) {
    // On mobile, we should guide users to open in their wallet's browser
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      navigator.userAgent.toLowerCase(),
    )

    if (isMobile) {
      throw new Error("Please open this dApp in your wallet's browser to connect")
    } else {
      throw new Error("No Ethereum wallet found. Please install MetaMask or another wallet.")
    }
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await provider.send("eth_requestAccounts", [])

    if (accounts.length > 0) {
      // Store the connection
      storeWalletConnection(accounts[0])

      return {
        address: accounts[0],
        provider,
      }
    }
    return null
  } catch (error) {
    console.error("Error connecting wallet:", error)
    throw error
  }
}

// Disconnect wallet
export function disconnectWallet() {
  clearWalletConnection()
}
