"use server"

// Simple in-memory database for development and testing
const inMemoryDatabase = {
  claims: new Map<string, ClaimRecord>(),
}

interface ClaimRecord {
  walletAddress: string
  txHash: string
  timestamp: number
}

export async function checkAndRecordClaim(
  walletAddress: string,
  action: "check" | "record",
  data?: { txHash: string; timestamp: number },
): Promise<ClaimRecord | null> {
  try {
    const normalizedAddress = walletAddress.toLowerCase()

    // Check if wallet has already claimed
    if (action === "check" || action === "record") {
      const existingClaim = inMemoryDatabase.claims.get(normalizedAddress)
      if (existingClaim) {
        return existingClaim
      }
    }

    // Record new claim
    if (action === "record" && data) {
      const claimData: ClaimRecord = {
        walletAddress: normalizedAddress,
        txHash: data.txHash,
        timestamp: data.timestamp,
      }

      inMemoryDatabase.claims.set(normalizedAddress, claimData)
      console.log(`Recorded claim for ${normalizedAddress}: ${data.txHash}`)
    }

    return null
  } catch (error) {
    console.error("Error checking or recording claim:", error)
    return null
  }
}
