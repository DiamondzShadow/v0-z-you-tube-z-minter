"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Smartphone, Copy, Check } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { WalletQRCode } from "./wallet-qr-code"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MobileWalletConnectorProps {
  onConnect: (address: string, provider: any) => void
}

export function MobileWalletConnector({ onConnect }: MobileWalletConnectorProps) {
  const [copied, setCopied] = useState(false)
  const { isMobile } = useMobile()
  const dappUrl = typeof window !== "undefined" ? window.location.href : ""

  // Function to copy the dApp URL to clipboard
  const copyToClipboard = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(dappUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Deep link to MetaMask
  const openMetaMask = () => {
    if (typeof window !== "undefined") {
      // For iOS
      window.location.href = `metamask://dapp/${encodeURIComponent(dappUrl)}`

      // Fallback for Android
      setTimeout(() => {
        window.location.href = "https://metamask.app.link/"
      }, 1000)
    }
  }

  // Deep link to Trust Wallet
  const openTrustWallet = () => {
    if (typeof window !== "undefined") {
      window.location.href = `trust://open_url?url=${encodeURIComponent(dappUrl)}`
    }
  }

  // Open WalletConnect
  const openWalletConnect = () => {
    // This would be replaced with actual WalletConnect implementation
    console.log("Opening WalletConnect")
  }

  if (!isMobile) return null

  return (
    <Card className="bg-zinc-800/50 border-zinc-700 mb-4">
      <CardContent className="pt-4">
        <Tabs defaultValue="wallets">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="wallets">Wallet Apps</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="wallets">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Mobile Wallet Connection</h3>
            </div>

            <p className="text-sm text-zinc-400 mb-4">
              Connect your mobile wallet by opening this dApp directly in your wallet's browser:
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={openMetaMask}>
                <img src="/metamask-logo.png" alt="MetaMask" className="h-4 w-4" />
                MetaMask
              </Button>

              <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={openTrustWallet}>
                <img src="/trust-wallet-logo.png" alt="Trust Wallet" className="h-4 w-4" />
                Trust Wallet
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 col-span-2"
                onClick={openWalletConnect}
              >
                <img src="/walletconnect-logo.png" alt="WalletConnect" className="h-4 w-4" />
                WalletConnect
              </Button>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="text-xs text-zinc-500 truncate flex-1">{dappUrl}</div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <p className="text-xs text-zinc-500">Alternatively, copy this URL and paste it in your wallet's browser.</p>
          </TabsContent>

          <TabsContent value="qrcode">
            <WalletQRCode url={dappUrl} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
