"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

export function WalletGuide() {
  const [isOpen, setIsOpen] = useState(false)
  const { isMobile } = useMobile()

  const toggleGuide = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="mb-4">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center justify-between w-full text-zinc-400 hover:text-zinc-300"
        onClick={toggleGuide}
      >
        <div className="flex items-center">
          <HelpCircle className="h-4 w-4 mr-2" />
          <span>How to connect your wallet {isMobile ? "on mobile" : ""}</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <Card className="mt-2 bg-zinc-800/50 border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Wallet Connection Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-zinc-400">
            {isMobile ? (
              <div className="space-y-2">
                <p className="font-medium text-zinc-300">Option 1: Open in your wallet's browser</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Open your wallet app (MetaMask, Trust Wallet, etc.)</li>
                  <li>Find the browser/dApp browser in your wallet</li>
                  <li>Paste this URL or use the buttons above to open directly</li>
                </ol>

                <p className="font-medium text-zinc-300 pt-2">Option 2: Use WalletConnect</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Click the WalletConnect button</li>
                  <li>Scan the QR code with your wallet app</li>
                  <li>Approve the connection request</li>
                </ol>

                <p className="text-amber-400 mt-2">
                  Note: For the best experience, we recommend opening this dApp directly in your wallet's browser.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-medium text-zinc-300">Option 1: Browser Extension</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Install MetaMask or another Ethereum wallet extension</li>
                  <li>Click the "Connect Wallet" button</li>
                  <li>Approve the connection request in your wallet</li>
                </ol>

                <p className="font-medium text-zinc-300 pt-2">Option 2: WalletConnect</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Have your mobile wallet ready</li>
                  <li>Click the WalletConnect option when connecting</li>
                  <li>Scan the QR code with your wallet app</li>
                  <li>Approve the connection request</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
