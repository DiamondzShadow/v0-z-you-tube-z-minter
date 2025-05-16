import { type NextRequest, NextResponse } from "next/server"
import { getTokenBalance } from "@/lib/blockchain"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Address parameter is required" }, { status: 400 })
  }

  try {
    const balance = await getTokenBalance(address)
    return NextResponse.json({ balance })
  } catch (error: any) {
    console.error("Error fetching token balance:", error)
    // Return a default balance of "0" in case of error to prevent UI breaking
    return NextResponse.json({ balance: "0", error: error.message || "Failed to fetch token balance" })
  }
}
