"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Wallet, LogOut } from "lucide-react"
import { connectWallet, disconnectWallet, checkWalletConnection } from "@/lib/wallet-connect"
import { ethers } from "ethers"
import { useMobile } from "@/hooks/use-mobile"
import { MobileWalletConnector } from "./mobile-wallet-connector"

interface WalletConnectorProps {
  onConnect: (address: string, provider: any) => void
  onDisconnect: () => void
}

export function WalletConnector({ onConnect, onDisconnect }: WalletConnectorProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const { isMobile, mounted: isMobileMounted } = useMobile()

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if wallet is already connected on component mount
  useEffect(() => {
    if (!mounted) return

    const restoreConnection = async () => {
      try {
        const connection = await checkWalletConnection()
        if (connection) {
          console.log("Restored wallet connection:", connection.address)
          setAddress(connection.address)
          onConnect(connection.address, connection.provider)
        }
      } catch (err) {
        console.error("Failed to restore wallet connection:", err)
      }
    }

    restoreConnection()
  }, [onConnect, mounted])

  // Listen for account changes
  useEffect(() => {
    if (!mounted) return
    if (typeof window === "undefined" || !window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected from wallet UI
        console.log("Accounts changed to empty array - user disconnected from wallet UI")
        handleDisconnect()
      } else if (address && accounts[0].toLowerCase() !== address.toLowerCase()) {
        // Account changed
        console.log("Account changed to:", accounts[0])
        setAddress(accounts[0])
        const provider = new ethers.BrowserProvider(window.ethereum)
        onConnect(accounts[0], provider)
      }
    }

    if (window.ethereum.on) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [onConnect, onDisconnect, mounted, address])

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const connection = await connectWallet()
      if (connection) {
        setAddress(connection.address)
        onConnect(connection.address, connection.provider)
      }
    } catch (err: any) {
      console.error("Error connecting wallet:", err)
      setError(err.message || "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    console.log("Disconnecting wallet in WalletConnector component")
    setIsDisconnecting(true)

    // Clear local state
    setAddress(null)

    // Disconnect wallet
    disconnectWallet()

    // Call the parent's onDisconnect callback
    onDisconnect()

    // Show disconnection message for 2 seconds
    setTimeout(() => {
      setIsDisconnecting(false)
    }, 2000)

    console.log("Wallet disconnected in WalletConnector component")
  }

  // Don't render anything during SSR
  if (!mounted || !isMobileMounted) {
    return null
  }

  // Show mobile wallet connector if on mobile
  if (isMobile && !address) {
    return <MobileWalletConnector onConnect={onConnect} />
  }

  if (isDisconnecting) {
    return (
      <div className="space-y-2">
        <div className="w-full p-2 bg-zinc-700 rounded-md text-center">
          <p className="text-sm text-zinc-200">Wallet disconnected</p>
          <p className="text-xs text-zinc-400">You can now connect a different wallet</p>
        </div>
      </div>
    )
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
      <Button onClick={handleConnectWallet} disabled={isConnecting} className="w-full">
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
      {mounted && typeof window !== "undefined" && !window.ethereum && !isMobile && (
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
      isMetaMask?: boolean
    }
  }
}
