"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, ExternalLink, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WalletConnector } from "./wallet-connector"
import { TransactionStatus } from "./transaction-status"
import { formatDistanceToNow } from "date-fns"

interface Transaction {
  txHash: string
  timestamp: number
  tokenAmount: string
  status: string
  blockNumber?: number
}

export default function TransactionHistory() {
  const [mounted, setMounted] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle wallet connection
  const handleWalletConnect = (walletAddress: string) => {
    console.log("Wallet connected in history:", walletAddress)
    setAddress(walletAddress)
  }

  // Handle wallet disconnection
  const handleWalletDisconnect = () => {
    console.log("Wallet disconnection requested in history")
    setAddress(null)
    setTransactions([])
    console.log("Wallet state cleared in history")
  }

  // Fetch transaction history when wallet is connected
  useEffect(() => {
    if (!mounted || !address) return

    const fetchTransactionHistory = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/transaction-history?address=${address}`)

        if (!response.ok) {
          throw new Error("Failed to fetch transaction history")
        }

        const data = await response.json()
        setTransactions(data.transactions)
      } catch (err: any) {
        console.error("Error fetching transaction history:", err)
        setError(err.message || "Failed to fetch transaction history")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactionHistory()
  }, [address, mounted])

  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === "all") return true
    return tx.status === activeTab
  })

  // Don't render anything during SSR
  if (!mounted) {
    return (
      <Card className="w-full bg-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-zinc-800 border-zinc-700">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>View your past token claims and transaction history</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Wallet Connection */}
        {!address ? (
          <div className="mb-6">
            <p className="text-sm text-zinc-400 mb-2">Connect your wallet to view your transaction history</p>
            <WalletConnector onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} />
          </div>
        ) : (
          <div className="mb-4">
            <Badge variant="outline" className="text-zinc-300">
              Wallet: {address.slice(0, 6)}...{address.slice(-4)}
            </Badge>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* No Transactions */}
        {!isLoading && !error && address && transactions.length === 0 && (
          <div className="text-center py-10 text-zinc-400">
            <p>No transactions found for this wallet.</p>
            <p className="text-sm mt-2">Claim tokens on the main page to see your transaction history.</p>
          </div>
        )}

        {/* Transaction List */}
        {!isLoading && !error && address && transactions.length > 0 && (
          <>
            <Tabs defaultValue="all" className="mb-4" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="failed">Failed</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <div className="space-y-4">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-6 text-zinc-400">
                      <p>No {activeTab} transactions found.</p>
                    </div>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <div key={tx.txHash} className="border border-zinc-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-zinc-200">{tx.tokenAmount} Tokens</h3>
                            <p className="text-xs text-zinc-400">
                              {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                          <a
                            href={`https://arbiscan.io/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs flex items-center gap-1 text-zinc-400 hover:text-zinc-300 transition-colors"
                          >
                            View on Explorer <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>

                        <TransactionStatus txHash={tx.txHash} />
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  )
}
