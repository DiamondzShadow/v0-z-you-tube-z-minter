import { type NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const txHash = searchParams.get("txHash")

  if (!txHash) {
    return NextResponse.json({ error: "Transaction hash is required" }, { status: 400 })
  }

  try {
    // For development or if environment variables are missing
    if (process.env.NODE_ENV !== "production" || !process.env.RPC_URL) {
      // Simulate transaction status for development
      return simulateTransactionStatus(txHash)
    }

    const rpcUrl = process.env.RPC_URL
    const provider = new ethers.JsonRpcProvider(rpcUrl)

    // Get transaction
    const tx = await provider.getTransaction(txHash)

    if (!tx) {
      return NextResponse.json({
        status: "not_found",
        confirmations: 0,
        error: "Transaction not found",
      })
    }

    // If transaction hasn't been mined yet
    if (!tx.blockNumber) {
      return NextResponse.json({
        status: "pending",
        confirmations: 0,
      })
    }

    // Get transaction receipt to check status
    const receipt = await provider.getTransactionReceipt(txHash)

    if (!receipt) {
      return NextResponse.json({
        status: "mining",
        confirmations: tx.confirmations || 0,
        blockNumber: tx.blockNumber,
      })
    }

    // Get block for timestamp
    const block = await provider.getBlock(tx.blockNumber)

    return NextResponse.json({
      status: receipt.status === 1 ? "confirmed" : "failed",
      confirmations: tx.confirmations || 0,
      blockNumber: tx.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: receipt.effectiveGasPrice.toString(),
      timestamp: block?.timestamp,
    })
  } catch (error: any) {
    console.error("Error checking transaction status:", error)
    return NextResponse.json(
      {
        status: "not_found",
        confirmations: 0,
        error: error.message || "Failed to check transaction status",
      },
      { status: 500 },
    )
  }
}

// Helper function to simulate transaction status for development
function simulateTransactionStatus(txHash: string) {
  // Use the last character of the hash to determine a simulated status
  const lastChar = txHash.slice(-1)
  const charCode = lastChar.charCodeAt(0)

  // Current timestamp in seconds
  const now = Math.floor(Date.now() / 1000)

  // Simulate different statuses based on the hash
  if (charCode % 10 === 0) {
    return NextResponse.json({
      status: "pending",
      confirmations: 0,
    })
  } else if (charCode % 10 === 1) {
    return NextResponse.json({
      status: "mining",
      confirmations: 1,
      blockNumber: 12345678,
    })
  } else if (charCode % 10 === 2) {
    return NextResponse.json({
      status: "failed",
      confirmations: 3,
      blockNumber: 12345678,
      gasUsed: "21000",
      effectiveGasPrice: "5000000000",
      timestamp: now - 300,
      error: "Transaction reverted",
    })
  } else {
    return NextResponse.json({
      status: "confirmed",
      confirmations: 5,
      blockNumber: 12345678,
      gasUsed: "21000",
      effectiveGasPrice: "5000000000",
      timestamp: now - 600,
    })
  }
}
