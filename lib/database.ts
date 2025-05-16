"use server"

// Simple in-memory database for development and testing
const inMemoryDatabase = {
  claims: new Map<string, ClaimRecord>(),
}

interface ClaimRecord {
  walletAddress: string
  txHash: string
  timestamp: number
  status: "pending" | "complete" | "failed"
}

export async function checkAndRecordClaim(
  walletAddress: string,
  action: "check" | "record-pending" | "record-complete" | "record-failed",
  data?: { txHash: string; timestamp: number },
): Promise<ClaimRecord | null> {
  try {
    const normalizedAddress = walletAddress.toLowerCase()

    // Check if wallet has already claimed
    if (action === "check") {
      const existingClaim = inMemoryDatabase.claims.get(normalizedAddress)

      // Only return completed claims as "already claimed"
      if (existingClaim && (existingClaim.status === "complete" || existingClaim.status === "pending")) {
        console.log(`Found existing claim for ${normalizedAddress}: ${JSON.stringify(existingClaim)}`)
        return existingClaim
      }
      return null
    }

    // Record new pending claim
    if (action === "record-pending" && data) {
      // Double-check that there's no existing claim
      const existingClaim = inMemoryDatabase.claims.get(normalizedAddress)
      if (existingClaim && (existingClaim.status === "complete" || existingClaim.status === "pending")) {
        console.log(`Attempted to create duplicate pending claim for ${normalizedAddress}`)
        return existingClaim
      }

      const claimData: ClaimRecord = {
        walletAddress: normalizedAddress,
        txHash: data.txHash,
        timestamp: data.timestamp,
        status: "pending",
      }

      inMemoryDatabase.claims.set(normalizedAddress, claimData)
      console.log(`Recorded pending claim for ${normalizedAddress}`)
      return claimData
    }

    // Update pending claim to complete
    if (action === "record-complete" && data) {
      const existingClaim = inMemoryDatabase.claims.get(normalizedAddress)
      if (!existingClaim) {
        console.log(`No pending claim found for ${normalizedAddress} to complete`)
        return null
      }

      const updatedClaim: ClaimRecord = {
        ...existingClaim,
        txHash: data.txHash,
        timestamp: data.timestamp,
        status: "complete",
      }

      inMemoryDatabase.claims.set(normalizedAddress, updatedClaim)
      console.log(`Updated claim to complete for ${normalizedAddress}: ${data.txHash}`)
      return updatedClaim
    }

    // Mark claim as failed
    if (action === "record-failed" && data) {
      const existingClaim = inMemoryDatabase.claims.get(normalizedAddress)
      if (!existingClaim) {
        console.log(`No pending claim found for ${normalizedAddress} to mark as failed`)
        return null
      }

      const updatedClaim: ClaimRecord = {
        ...existingClaim,
        txHash: data.txHash,
        timestamp: data.timestamp,
        status: "failed",
      }

      inMemoryDatabase.claims.set(normalizedAddress, updatedClaim)
      console.log(`Marked claim as failed for ${normalizedAddress}`)
      return updatedClaim
    }

    return null
  } catch (error) {
    console.error("Error checking or recording claim:", error)
    return null
  }
}
