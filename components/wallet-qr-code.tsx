"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, Copy, Check } from "lucide-react"

interface WalletQRCodeProps {
  url: string
}

export function WalletQRCode({ url }: WalletQRCodeProps) {
  const [copied, setCopied] = useState(false)
  const [qrCodeSrc, setQrCodeSrc] = useState("")

  useEffect(() => {
    // Generate QR code for the URL
    // In a real implementation, you would use a QR code library
    // For this example, we'll use a placeholder
    setQrCodeSrc(`/placeholder.svg?height=200&width=200&query=QR code for ${url}`)
  }, [url])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="bg-zinc-800/50 border-zinc-700">
      <CardContent className="pt-4 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3">
          <QrCode className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Scan with your wallet</h3>
        </div>

        <div className="bg-white p-3 rounded-lg mb-3">
          <img src={qrCodeSrc || "/placeholder.svg"} alt="QR Code" className="w-48 h-48" />
        </div>

        <div className="flex items-center gap-2 w-full">
          <div className="text-xs text-zinc-500 truncate flex-1">{url}</div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard}>
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
