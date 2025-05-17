"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface NetworkSwitcherProps {
  address: string | null
}

export function NetworkSwitcher({ address }: NetworkSwitcherProps) {
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const switchNetwork = async () => {
    if (!address || !window.ethereum) return

    setIsSwitching(true)
    setError(null)

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x7FA5", // 32677 in hex
            chainName: "Diamond zShadow Chain",
            nativeCurrency: {
              name: "DIAMD",
              symbol: "DIAMD",
              decimals: 18,
            },
            rpcUrls: ["https://rpc-diamondzshadow-rt5jq9kej1.conduit.xyz"],
            blockExplorerUrls: ["https://explorer-diamondzshadow-rt5jq9kej1.conduit.xyz"],
          },
        ],
      })
      setIsCorrectNetwork(true)
    } catch (err: any) {
      console.error("Failed to switch network:", err)
      setError(err.message || "Failed to switch network")
    } finally {
      setIsSwitching(false)
    }
  }

  if (!address) return null

  if (isCorrectNetwork) {
    return (
      <Alert className="bg-green-900/20 border-green-800 text-green-400">
        <Check className="h-4 w-4" />
        <AlertTitle>Connected to Diamond zShadow</AlertTitle>
        <AlertDescription>Your wallet is connected to the correct network.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-2">
      <Button onClick={switchNetwork} disabled={isSwitching} className="w-full">
        {isSwitching ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Switching Network...
          </>
        ) : (
          "Switch to Diamond zShadow Network"
        )}
      </Button>

      {error && (
        <Alert className="bg-red-900/20 border-red-800 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
