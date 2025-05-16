"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Wallet, LogOut } from "lucide-react"
import { ethers } from "ethers"

interface WalletConnectorProps {
  onConnect: (address: string, provider: any) => void
  onDisconnect: () => void
}

export function WalletConnector({ onConnect, onDisconnect }: WalletConnectorProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if wallet is already connected on component mount
  useEffect(() => {
    if (!mounted) return

    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await provider.listAccounts()

          if (accounts.length > 0) {
            setAddress(accounts[0].address)
            onConnect(accounts[0].address, provider)
          }
        } catch (err) {
          console.error("Failed to check wallet connection:", err)
        }
      }
    }

    checkConnection()
  }, [onConnect, mounted])

  // Listen for account changes
  useEffect(() => {
    if (!mounted) return
    if (typeof window === "undefined" || !window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        handleDisconnect()
      } else {
        // Account changed
        setAddress(accounts[0])
        const provider = new ethers.BrowserProvider(window.ethereum)
        onConnect(accounts[0], provider)
      }
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [onConnect, onDisconnect, mounted])

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("No Ethereum wallet found. Please install MetaMask or another wallet.")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])

      if (accounts.length > 0) {
        setAddress(accounts[0])
        onConnect(accounts[0], provider)
      }
    } catch (err: any) {
      console.error("Error connecting wallet:", err)
      setError(err.message || "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    // Clear local state
    setAddress(null)

    // Call the parent's onDisconnect callback
    onDisconnect()

    // Add localStorage cleanup if you're storing any wallet info
    if (typeof window !== "undefined") {
      localStorage.removeItem("walletConnected")
      // Add any other wallet-related items you might be storing
    }

    console.log("Wallet disconnected")
  }

  // Don't render anything during SSR
  if (!mounted) {
    return null
  }

  if (address) {
    return (
      <div className="space-y-2">
        <Button variant="outline" onClick={handleDisconnect} className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect Wallet
        </Button>
        <p className="text-xs text-zinc-400">
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button onClick={connectWallet} disabled={isConnecting} className="w-full">
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {mounted && typeof window !== "undefined" && !window.ethereum && (
        <p className="text-xs text-amber-400">
          No wallet detected. Please install MetaMask or another Ethereum wallet.
        </p>
      )}
    </div>
  )
}

// Add type definition for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, listener: (...args: any[]) => void) => void
      removeListener: (event: string, listener: (...args: any[]) => void) => void
    }
  }
}
