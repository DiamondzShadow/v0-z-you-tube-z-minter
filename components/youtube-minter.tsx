"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Youtube, Wallet, Check, AlertCircle } from "lucide-react"
import { WalletConnector } from "./wallet-connector"
import { GoogleLoginButton } from "./google-login-button"
import { useGoogleAuth } from "@/hooks/use-google-auth"
import { verifyAndMint } from "@/lib/actions"

export default function YouTubeMinter() {
  const [mounted, setMounted] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<any | null>(null)
  const { user, token, login, isLoading: isGoogleLoading } = useGoogleAuth()

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [txHash, setTxHash] = useState("")
  const [tokenBalance, setTokenBalance] = useState<string | null>(null)

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle wallet connection
  const handleWalletConnect = (walletAddress: string, walletProvider: any) => {
    setAddress(walletAddress)
    setProvider(walletProvider)
  }

  // Handle wallet disconnection
  const handleWalletDisconnect = () => {
    setAddress(null)
    setProvider(null)
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

    try {
      setStatus("loading")
      setMessage("Verifying subscription and minting tokens...")

      const result = await verifyAndMint(address, token)

      if (result.success) {
        setStatus("success")
        setMessage("Successfully minted 250 tokens to your wallet!")
        setTxHash(result.txHash)
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
        <CardTitle className="text-2xl flex items-center gap-2">
          <Youtube className="h-6 w-6 text-red-500" />
          YouTube Token Minter
        </CardTitle>
        <CardDescription>Subscribe to our YouTube channel and claim 250 tokens as a reward</CardDescription>
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
          <Button className="w-full" onClick={handleClaim} disabled={!address || !user || status === "loading"}>
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying & Minting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Claim 250 Tokens
              </>
            )}
          </Button>
        </div>

        {/* Status Messages */}
        {status === "success" && (
          <Alert className="bg-green-900/20 border-green-800 text-green-400">
            <Check className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              {message}
              {txHash && (
                <a
                  href={`https://arbiscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 text-xs underline"
                >
                  View transaction
                </a>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert className="bg-red-900/20 border-red-800 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
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
