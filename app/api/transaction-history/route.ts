import { type NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"

// Mock transaction history for development
const mockTransactions = [
  {
    txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    tokenAmount: "250",
    status: "confirmed",
    blockNumber: 12345678,
  },
  {
    txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    tokenAmount: "250",
    status: "confirmed",
    blockNumber: 12345670,
  },
  {
    txHash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    tokenAmount: "250",
    status: "pending",
  },
  {
    txHash: "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    tokenAmount: "250",
    status: "failed",
    blockNumber: 12345660,
  },
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
  }

  try {
    // For development or if environment variables are missing
    if (process.env.NODE_ENV !== "production" || !process.env.RPC_URL || !process.env.CONTRACT_ADDRESS) {
      // Return mock data for development
      return NextResponse.json({
        transactions: mockTransactions,
      })
    }

    // In production, we would fetch real transaction history from the blockchain or a database
    // This would typically involve:
    // 1. Querying the contract for Transfer events to the user's address
    // 2. Fetching transaction details for each event
    // 3. Formatting the data for display

    const rpcUrl = process.env.RPC_URL
    const contractAddress = process.env.CONTRACT_ADDRESS

    const provider = new ethers.JsonRpcProvider(rpcUrl)

    // ABI fragment for Transfer event
    const abi = ["event Transfer(address indexed from, address indexed to, uint256 value)"]

    const contract = new ethers.Contract(contractAddress, abi, provider)

    // Get the last 100 blocks (adjust as needed)
    const currentBlock = await provider.getBlockNumber()
    const fromBlock = currentBlock - 100000 // Look back ~2 weeks on Arbitrum

    // Query for Transfer events to the user's address
    const filter = contract.filters.Transfer(null, address)
    const events = await contract.queryFilter(filter, fromBlock)

    // Process events into transaction history
    const transactions = await Promise.all(
      events.map(async (event) => {
        const block = await event.getBlock()
        const tx = await event.getTransaction()

        return {
          txHash: tx.hash,
          timestamp: block.timestamp * 1000, // Convert to milliseconds
          tokenAmount: ethers.formatUnits(event.args[2], 18),
          status: "confirmed",
          blockNumber: block.number,
        }
      }),
    )

    return NextResponse.json({
      transactions: transactions.sort((a, b) => b.timestamp - a.timestamp), // Sort by newest first
    })
  } catch (error: any) {
    console.error("Error fetching transaction history:", error)

    // For development, return mock data even on error
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({
        transactions: mockTransactions,
      })
    }

    return NextResponse.json({ error: error.message || "Failed to fetch transaction history" }, { status: 500 })
  }
}
