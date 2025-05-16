import { type NextRequest, NextResponse } from "next/server"
import { checkAndRecordClaim } from "@/lib/database"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
  }

  try {
    // Check if wallet has already claimed
    const existingClaim = await checkAndRecordClaim(address.toLowerCase(), "check")

    if (existingClaim) {
      return NextResponse.json({
        hasClaimed: true,
        txHash: existingClaim.txHash,
        timestamp: existingClaim.timestamp,
        status: existingClaim.status,
      })
    }

    return NextResponse.json({
      hasClaimed: false,
    })
  } catch (error: any) {
    console.error("Error checking claim status:", error)

    // For development, return a safe default
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({
        hasClaimed: false,
        error: error.message || "Failed to check claim status",
      })
    }

    return NextResponse.json({ error: error.message || "Failed to check claim status" }, { status: 500 })
  }
}
