"use client"

import { useState, useEffect } from "react"

export type TransactionStatus = "pending" | "mining" | "confirmed" | "failed" | "not_found"

interface TransactionDetails {
  status: TransactionStatus
  confirmations: number
  blockNumber?: number
  gasUsed?: string
  effectiveGasPrice?: string
  timestamp?: number
  error?: string
}

export function useTransactionStatus(txHash: string | null, rpcUrl?: string) {
  const [status, setStatus] = useState<TransactionDetails>({
    status: "pending",
    confirmations: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!txHash) return

    let isMounted = true
    let intervalId: NodeJS.Timeout

    const checkTransactionStatus = async () => {
      if (!txHash) return

      setIsLoading(true)

      try {
        // Use the provided RPC URL or fetch from the API
        const response = await fetch(`/api/transaction-status?txHash=${txHash}`)

        if (!response.ok) {
          throw new Error("Failed to fetch transaction status")
        }

        const data = await response.json()

        if (isMounted) {
          setStatus(data)
        }
      } catch (error) {
        console.error("Error checking transaction status:", error)
        if (isMounted) {
          setStatus((prev) => ({
            ...prev,
            error: "Failed to check transaction status",
          }))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // Check immediately
    checkTransactionStatus()

    // Then check every 5 seconds
    intervalId = setInterval(checkTransactionStatus, 5000)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [txHash, rpcUrl])

  return { status, isLoading }
}
