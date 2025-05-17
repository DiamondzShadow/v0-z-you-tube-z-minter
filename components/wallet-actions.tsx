"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signMessage, sendTransaction, getWalletBalance } from "@/lib/wallet-connect"
import type { ethers } from "ethers"
import { Loader2, Check, AlertCircle } from "lucide-react"

interface WalletActionsProps {
  address: string
  provider: ethers.BrowserProvider
}

export function WalletActions({ address, provider }: WalletActionsProps) {
  const [message, setMessage] = useState("")
  const [signature, setSignature] = useState("")
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [balance, setBalance] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSignMessage = async () => {
    if (!message) return

    setIsLoading(true)
    setError("")
    setSuccess("")
    setSignature("")

    try {
      const sig = await signMessage(message, provider)
      setSignature(sig)
      setSuccess("Message signed successfully!")
    } catch (err: any) {
      setError(err.message || "Failed to sign message")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendTransaction = async () => {
    if (!recipient || !amount) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const tx = await sendTransaction(recipient, amount, provider)
      setSuccess(`Transaction sent! Hash: ${tx.hash}`)
    } catch (err: any) {
      setError(err.message || "Failed to send transaction")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetBalance = async () => {
    setIsLoading(true)
    setError("")

    try {
      const bal = await getWalletBalance(address, provider)
      setBalance(bal)
    } catch (err: any) {
      setError(err.message || "Failed to get balance")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-zinc-800 border-zinc-700 mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Wallet Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Get Balance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Native Balance</Label>
            <Button variant="outline" size="sm" onClick={handleGetBalance} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get Balance"}
            </Button>
          </div>
          {balance && <div className="p-2 bg-zinc-900 rounded text-sm">{balance} ETH</div>}
        </div>

        {/* Sign Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Sign Message</Label>
          <div className="flex gap-2">
            <Input
              id="message"
              placeholder="Enter a message to sign"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-zinc-900 border-zinc-700"
            />
            <Button onClick={handleSignMessage} disabled={!message || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign"}
            </Button>
          </div>
          {signature && (
            <div className="p-2 bg-zinc-900 rounded text-xs break-all">
              <div className="font-medium mb-1">Signature:</div>
              {signature}
            </div>
          )}
        </div>

        {/* Send Transaction */}
        <div className="space-y-2">
          <Label htmlFor="recipient">Send Transaction</Label>
          <Input
            id="recipient"
            placeholder="Recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="bg-zinc-900 border-zinc-700 mb-2"
          />
          <div className="flex gap-2">
            <Input
              id="amount"
              placeholder="Amount in ETH"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-zinc-900 border-zinc-700"
            />
            <Button onClick={handleSendTransaction} disabled={!recipient || !amount || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-2 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-2 bg-green-900/20 border border-green-800 rounded text-green-400 text-sm flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
