"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Youtube, Wallet, Check, AlertCircle, History, XCircle } from "lucide-react"
import { WalletConnector } from "./wallet-connector"
import { GoogleLoginButton } from "./google-login-button"
import { useGoogleAuth } from "@/hooks/use-google-auth"
import { verifyAndMint } from "@/lib/actions"
import { TransactionStatus } from "./transaction-status"
import Link from "next/link"

export default function YouTubeMinter() {
  const [mounted, setMounted] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<any | null>(null)
  const { user, token, login, isLoading: isGoogleLoading } = useGoogleAuth()

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "already-claimed">("idle")
  const [message, setMessage] = useState("")
  const [txHash, setTxHash] = useState("")
  const [tokenBalance, setTokenBalance] = useState<string | null>(null)
  const [showTxStatus, setShowTxStatus] = useState(false)
  const [hasAlreadyClaimed, setHasAlreadyClaimed] = useState(false)

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

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

    console.log("Wallet state cleared")
  }

  // Check if wallet has already claimed
  async function checkWalletClaimStatus(walletAddress: string) {
    try {
      const response = await fetch(`/api/check-claim-status?address=${walletAddress}`)
      const data = await response.json()

      if (data.hasClaimed) {
        setHasAlreadyClaimed(true)
        setStatus("already-claimed")
        setMessage("This wallet has already claimed tokens. Each wallet can only claim once.")
        if (data.txHash && data.txHash !== "pending" && data.txHash !== "failed") {
          setTxHash(data.txHash)
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
    if (!address || !token) {
      setMessage("Please connect your wallet and Google account first")
      return
    }

    // Double-check that wallet hasn't already claimed
    if (hasAlreadyClaimed) {
      setStatus("already-claimed")
      setMessage("This wallet has already claimed tokens. Each wallet can only claim once.")
      return
    }

    try {
      setStatus("loading")
      setMessage("Verifying subscription and minting tokens...")
      setShowTxStatus(false)

      const result = await verifyAndMint(address, token)

      if (result.success) {
        setStatus("success")
        setMessage("Successfully minted 250 tokens to your wallet!")
        setTxHash(result.txHash)
        setShowTxStatus(true)
        // Refresh token balance after successful mint
        fetchTokenBalance(address)
      } else if (result.alreadyClaimed) {
        setStatus("already-claimed")
        setMessage("This wallet has already claimed tokens. Each wallet can only claim once.")
        setHasAlreadyClaimed(true)
        if (result.txHash) {
          setTxHash(result.txHash)
          setShowTxStatus(true)
        }
      } else {
        setStatus("error")
        setMessage(result.error || "Failed to mint tokens. Please try again.")
      }
    } catch (error) {
      setStatus("error")
      setMessage("An unexpected error occurred. Please try again.")
      console.error(error)
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
            <Youtube className="h-6 w-6 text-red-500" />
            YouTube Token Minter
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
              <Youtube className="h-6 w-6 text-red-500" />
              YouTube Token Minter
            </CardTitle>
            <CardDescription>Subscribe to our YouTube channel and claim 250 tokens as a reward</CardDescription>
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
        {/* Wallet Connection */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Step 1: Connect your wallet</div>
          <WalletConnector onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} />
          {address && tokenBalance && (
            <div className="text-xs text-zinc-400 mt-1">
              <Badge variant="outline" className="ml-2">
                Balance: {tokenBalance} Tokens
              </Badge>
            </div>
          )}
        </div>

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
            disabled={!address || !user || status === "loading" || hasAlreadyClaimed}
          >
            {status === "loading" ? (
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
                Claim 250 Tokens
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

        {/* Status Messages */}
        {status === "success" && !showTxStatus && (
          <Alert className="bg-green-900/20 border-green-800 text-green-400">
            <Check className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert className="bg-red-900/20 border-red-800 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "already-claimed" && (
          <Alert className="bg-amber-900/20 border-amber-800 text-amber-400">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Already Claimed</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="text-xs text-zinc-500 flex justify-between">
        <div>One claim per wallet</div>
        <div>Powered by YouTube API & Web3</div>
      </CardFooter>
    </Card>
  )
}
