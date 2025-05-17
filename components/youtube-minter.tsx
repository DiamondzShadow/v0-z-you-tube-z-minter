"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wallet, Check, AlertCircle, History, XCircle, X, Diamond } from "lucide-react"
import { WalletConnector } from "./wallet-connector"
import { GoogleLoginButton } from "./google-login-button"
import { useGoogleAuth } from "@/hooks/use-google-auth"
import { verifyAndMint } from "@/lib/actions"
import { TransactionStatus } from "./transaction-status"
import { DoubleClaimMessage } from "./double-claim-message"
import { WalletGuide } from "./wallet-guide"
import { WalletActions } from "./wallet-actions"
import Link from "next/link"

export default function YouTubeMinter() {
  const [mounted, setMounted] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<any | null>(null)
  const { user, token, login, isLoading: isGoogleLoading } = useGoogleAuth()
  const [showWalletActions, setShowWalletActions] = useState(false)

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "already-claimed">("idle")
  const [message, setMessage] = useState("")
  const [txHash, setTxHash] = useState("")
  const [tokenBalance, setTokenBalance] = useState<string | null>(null)
  const [showTxStatus, setShowTxStatus] = useState(false)
  const [hasAlreadyClaimed, setHasAlreadyClaimed] = useState(false)
  const [attemptedReclaimCount, setAttemptedReclaimCount] = useState(0)
  const [showDoubleClaimMessage, setShowDoubleClaimMessage] = useState(false)

  // State for persistent messages
  const [showStatusMessage, setShowStatusMessage] = useState(false)
  // Add a state to track if claim is in progress
  const [isClaimInProgress, setIsClaimInProgress] = useState(false)

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Make status messages persistent when status changes
  useEffect(() => {
    if (status !== "idle" && status !== "loading") {
      setShowStatusMessage(true)
    }
  }, [status])

  // Show double claim message when hasAlreadyClaimed changes
  useEffect(() => {
    if (hasAlreadyClaimed) {
      setShowDoubleClaimMessage(true)
    }
  }, [hasAlreadyClaimed])

  // Handle wallet connection
  const handleWalletConnect = (walletAddress: string, walletProvider: any) => {
    console.log("Wallet connected:", walletAddress)
    setAddress(walletAddress)
    setProvider(walletProvider)

    // Reset claim status when wallet changes
    setStatus("idle")
    setMessage("")
    setTxHash("")
    setShowTxStatus(false)
    setHasAlreadyClaimed(false)
    setShowStatusMessage(false)
    setIsClaimInProgress(false)
    setShowDoubleClaimMessage(false)
    setAttemptedReclaimCount(0)

    // Check if this wallet has already claimed
    checkWalletClaimStatus(walletAddress)
  }

  // Handle wallet disconnection
  const handleWalletDisconnect = () => {
    console.log("Wallet disconnection requested")
    // Clear all wallet-related state
    setAddress(null)
    setProvider(null)
    setTokenBalance(null)
    setHasAlreadyClaimed(false)
    setStatus("idle")
    setMessage("")
    setTxHash("")
    setShowTxStatus(false)
    setShowStatusMessage(false)
    setIsClaimInProgress(false)
    setShowDoubleClaimMessage(false)
    setAttemptedReclaimCount(0)
    setShowWalletActions(false)

    console.log("Wallet state cleared")
  }

  // Toggle wallet actions
  const toggleWalletActions = () => {
    setShowWalletActions(!showWalletActions)
  }

  // Dismiss status message
  const dismissStatusMessage = () => {
    setShowStatusMessage(false)
  }

  // Dismiss double claim message
  const dismissDoubleClaimMessage = () => {
    setShowDoubleClaimMessage(false)
  }

  // Check if wallet has already claimed
  async function checkWalletClaimStatus(walletAddress: string) {
    try {
      console.log("Checking claim status for wallet:", walletAddress)
      const response = await fetch(`/api/check-claim-status?address=${walletAddress}`)
      const data = await response.json()
      console.log("Claim status response:", data)

      if (data.hasClaimed) {
        setHasAlreadyClaimed(true)
        setStatus("already-claimed")
        setMessage("This wallet has already claimed tokens. Each wallet can only claim once.")
        setShowStatusMessage(true)
        setShowDoubleClaimMessage(true)

        if (data.txHash && data.txHash !== "pending" && data.txHash !== "failed") {
          setTxHash(data.txHash)
          setShowTxStatus(true)
        }
      }
    } catch (error) {
      console.error("Failed to check claim status:", error)
    }
  }

  // Check token balance when wallet is connected
  useEffect(() => {
    if (!mounted) return
    if (address) {
      fetchTokenBalance(address)
    }
  }, [address, status, mounted])

  async function fetchTokenBalance(walletAddress: string) {
    try {
      const response = await fetch(`/api/token-balance?address=${walletAddress}`)
      const data = await response.json()
      setTokenBalance(data.balance)
    } catch (error) {
      console.error("Failed to fetch token balance:", error)
    }
  }

  async function handleClaim() {
    // Prevent multiple claim attempts
    if (isClaimInProgress) {
      console.log("Claim already in progress, ignoring click")
      return
    }

    if (!address || !token) {
      setMessage("Please connect your wallet and Google account first")
      setStatus("error")
      setShowStatusMessage(true)
      return
    }

    // Double-check that wallet hasn't already claimed
    if (hasAlreadyClaimed) {
      // Increment the attempted reclaim counter
      const newCount = attemptedReclaimCount + 1
      setAttemptedReclaimCount(newCount)
      console.log("Attempted reclaim count:", newCount)

      // Show the double claim message with the updated count
      setShowDoubleClaimMessage(true)

      setStatus("already-claimed")
      setMessage("This wallet has already claimed tokens. Each wallet can only claim once.")
      setShowStatusMessage(true)
      return
    }

    try {
      console.log("Starting claim process for wallet:", address)
      setIsClaimInProgress(true)
      setStatus("loading")
      setMessage("Verifying subscription and minting tokens...")
      setShowTxStatus(false)
      setShowStatusMessage(true)

      const result = await verifyAndMint(address, token)
      console.log("Claim result:", result)

      if (result.success) {
        setStatus("success")
        setMessage("Successfully minted 250 DIAMD tokens to your wallet!")
        setTxHash(result.txHash)
        setShowTxStatus(true)
        setShowStatusMessage(true)
        // Refresh token balance after successful mint
        fetchTokenBalance(address)
      } else if (result.alreadyClaimed) {
        setStatus("already-claimed")
        setMessage("This wallet has already claimed tokens. Each wallet can only claim once.")
        setHasAlreadyClaimed(true)
        setShowStatusMessage(true)
        setShowDoubleClaimMessage(true)

        if (result.txHash) {
          setTxHash(result.txHash)
          setShowTxStatus(true)
        }
      } else {
        setStatus("error")
        setMessage(result.error || "Failed to mint tokens. Please try again.")
        setShowStatusMessage(true)
      }
    } catch (error: any) {
      console.error("Error during claim process:", error)

      // Check if the error is related to already claimed tokens
      if (error.message && error.message.toLowerCase().includes("already claimed")) {
        setStatus("already-claimed")
        setMessage("This wallet has already claimed tokens. Each wallet can only claim once.")
        setHasAlreadyClaimed(true)
        setShowStatusMessage(true)
        setShowDoubleClaimMessage(true)
      } else {
        setStatus("error")
        setMessage(error.message || "An unexpected error occurred. Please try again.")
        setShowStatusMessage(true)
      }
    } finally {
      setIsClaimInProgress(false)
    }
  }

  // Handle transaction confirmation
  const handleTransactionConfirmed = () => {
    // Refresh token balance when transaction is confirmed
    if (address) {
      fetchTokenBalance(address)
    }
  }

  // Don't render anything during SSR
  if (!mounted) {
    return (
      <Card className="w-full bg-zinc-800 border-zinc-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Diamond className="h-6 w-6 text-blue-400" />
            Diamond zShadow Token Minter
          </CardTitle>
          <CardDescription>Loading application...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-zinc-800 border-zinc-700">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Diamond className="h-6 w-6 text-blue-400" />
              Diamond zShadow Token Minter
            </CardTitle>
            <CardDescription>Subscribe to nlockchain media and claim 250 DIAMD tokens</CardDescription>
          </div>
          <Link href="/history">
            <Button variant="outline" size="sm" className="gap-2">
              <History className="h-4 w-4" />
              View History
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Double Claim Message */}
        {showDoubleClaimMessage && (
          <DoubleClaimMessage attemptCount={attemptedReclaimCount} onDismiss={dismissDoubleClaimMessage} />
        )}

        {/* Limited Availability Notice */}
        <Alert className="bg-blue-900/20 border-blue-800 text-blue-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Limited Availability</AlertTitle>
          <AlertDescription>
            Only the first 1,000 subscribers can claim tokens. Currently at{" "}
            <span className="font-bold text-white">247</span>/1,000 subscribers.
          </AlertDescription>
        </Alert>

        {/* Network Information */}
        <Alert className="bg-purple-900/20 border-purple-800 text-purple-300">
          <Diamond className="h-4 w-4" />
          <AlertTitle>Diamond zShadow Network</AlertTitle>
          <AlertDescription>
            You'll need to connect to the Diamond zShadow Chain (Chain ID: 32677) to use your tokens.
          </AlertDescription>
        </Alert>

        {/* Wallet Guide */}
        <WalletGuide />

        {/* Wallet Connection */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Step 1: Connect your wallet</div>
          <WalletConnector onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} />
          {address && tokenBalance && (
            <div className="flex items-center justify-between text-xs text-zinc-400 mt-1">
              <Badge variant="outline" className="ml-2">
                Balance: {tokenBalance} DIAMD
              </Badge>
              <Button variant="ghost" size="sm" onClick={toggleWalletActions} className="h-7 text-xs">
                {showWalletActions ? "Hide Wallet Actions" : "Show Wallet Actions"}
              </Button>
            </div>
          )}
        </div>

        {/* Wallet Actions (when connected) */}
        {address && provider && showWalletActions && <WalletActions address={address} provider={provider} />}

        {/* Google Login */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Step 2: Connect your Google account</div>
          <GoogleLoginButton onLogin={login} isLoading={isGoogleLoading} isConnected={!!user} email={user?.email} />
        </div>

        {/* Claim Button */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Step 3: Verify subscription & claim tokens</div>
          <Button
            className="w-full"
            onClick={handleClaim}
            disabled={!address || !user || status === "loading" || isClaimInProgress}
          >
            {status === "loading" || isClaimInProgress ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying & Minting...
              </>
            ) : hasAlreadyClaimed ? (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Already Claimed
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Claim 250 DIAMD Tokens
              </>
            )}
          </Button>
        </div>

        {/* Transaction Status */}
        {showTxStatus && txHash && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Transaction Status</div>
            <TransactionStatus txHash={txHash} onConfirmed={handleTransactionConfirmed} />
          </div>
        )}

        {/* Status Messages - Now with dismiss button */}
        {showStatusMessage && status === "success" && (
          <Alert className="bg-green-900/20 border-green-800 text-green-400 relative">
            <Check className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 text-green-400 hover:text-green-300 hover:bg-green-900/30"
              onClick={dismissStatusMessage}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        {showStatusMessage && status === "error" && (
          <Alert className="bg-red-900/20 border-red-800 text-red-400 relative">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-900/30"
              onClick={dismissStatusMessage}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        {showStatusMessage && status === "already-claimed" && (
          <Alert className="bg-amber-900/20 border-amber-800 text-amber-400 relative">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Already Claimed</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 text-amber-400 hover:text-amber-300 hover:bg-amber-900/30"
              onClick={dismissStatusMessage}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="text-xs text-zinc-500 flex justify-between">
        <div>Limited to first 1,000 subscribers</div>
        <div>Powered by Diamond zShadow</div>
      </CardFooter>
    </Card>
  )
}
