"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react"
import { useTransactionStatus, type TransactionStatus as TransactionStatusType } from "@/hooks/use-transaction-status"

interface TransactionStatusProps {
  txHash: string
  onConfirmed?: () => void
}

export function TransactionStatus({ txHash, onConfirmed }: TransactionStatusProps) {
  const { status, isLoading } = useTransactionStatus(txHash)

  // Call the onConfirmed callback when transaction is confirmed
  useEffect(() => {
    if (status.status === "confirmed" && status.confirmations >= 1 && onConfirmed) {
      onConfirmed()
    }
  }, [status, onConfirmed])

  const getStatusColor = (status: TransactionStatusType) => {
    switch (status) {
      case "confirmed":
        return "text-green-500"
      case "mining":
        return "text-yellow-500"
      case "pending":
        return "text-blue-500"
      case "failed":
        return "text-red-500"
      case "not_found":
        return "text-gray-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusIcon = (status: TransactionStatusType) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "mining":
        return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
      case "pending":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "not_found":
        return <XCircle className="h-5 w-5 text-gray-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: TransactionStatusType) => {
    switch (status) {
      case "confirmed":
        return "Transaction Confirmed"
      case "mining":
        return "Transaction Mining"
      case "pending":
        return "Transaction Pending"
      case "failed":
        return "Transaction Failed"
      case "not_found":
        return "Transaction Not Found"
      default:
        return "Checking Status..."
    }
  }

  const getProgressValue = (status: TransactionStatusType, confirmations: number) => {
    switch (status) {
      case "confirmed":
        return 100
      case "mining":
        return Math.min(75, 25 + confirmations * 25)
      case "pending":
        return 25
      case "failed":
        return 100
      case "not_found":
        return 0
      default:
        return 0
    }
  }

  return (
    <Card className="w-full bg-zinc-800/50 border-zinc-700">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.status)}
            <span className={`font-medium ${getStatusColor(status.status)}`}>{getStatusText(status.status)}</span>
          </div>
          <a
            href={`https://arbiscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            View on Explorer <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <Progress value={getProgressValue(status.status, status.confirmations)} className="h-2 mb-3" />

        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
          <div>
            <span className="block">Transaction Hash:</span>
            <span className="block text-zinc-300 truncate">
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </span>
          </div>
          <div>
            <span className="block">Confirmations:</span>
            <span className="block text-zinc-300">{status.confirmations}</span>
          </div>
          {status.blockNumber && (
            <div>
              <span className="block">Block Number:</span>
              <span className="block text-zinc-300">{status.blockNumber}</span>
            </div>
          )}
          {status.timestamp && (
            <div>
              <span className="block">Time:</span>
              <span className="block text-zinc-300">{new Date(status.timestamp * 1000).toLocaleTimeString()}</span>
            </div>
          )}
          {status.gasUsed && (
            <div>
              <span className="block">Gas Used:</span>
              <span className="block text-zinc-300">{status.gasUsed}</span>
            </div>
          )}
          {status.status === "confirmed" && (
            <div className="col-span-2 mt-1">
              <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-800">
                Transaction Successfully Completed
              </Badge>
            </div>
          )}
          {status.status === "failed" && status.error && (
            <div className="col-span-2 mt-1">
              <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-800">
                Error: {status.error}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
