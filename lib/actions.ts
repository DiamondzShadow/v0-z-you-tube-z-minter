"use server"

import { ethers } from "ethers"
import { getSubscriptionStatus } from "./youtube"
import { mintTokens } from "./blockchain"
import { checkAndRecordClaim } from "./database"

export async function verifyAndMint(walletAddress: string, googleAccessToken: string) {
  try {
    // Normalize the wallet address to ensure consistent checks
    const normalizedAddress = walletAddress.toLowerCase()

    // CRITICAL: Check if wallet has already claimed - this must happen FIRST
    const existingClaim = await checkAndRecordClaim(normalizedAddress, "check")

    if (existingClaim) {
      console.log(`Wallet ${normalizedAddress} has already claimed tokens. Preventing double mint.`)
      return {
        success: false,
        error: "This wallet has already claimed tokens. Each wallet can only claim once.",
        alreadyClaimed: true,
        txHash: existingClaim.txHash,
      }
    }

    // Verify YouTube subscription
    let isSubscribed = false
    try {
      isSubscribed = await getSubscriptionStatus(googleAccessToken)
    } catch (ytError) {
      console.error("YouTube verification failed:", ytError)
      return {
        success: false,
        error: "Failed to verify YouTube subscription. Please try again.",
      }
    }

    if (!isSubscribed) {
      return {
        success: false,
        error: "You need to subscribe to the YouTube channel first",
      }
    }

    // IMPORTANT: Record the claim BEFORE minting to prevent race conditions
    // This creates a "pending" claim record
    await checkAndRecordClaim(normalizedAddress, "record-pending", {
      txHash: "pending",
      timestamp: Date.now(),
    })

    // Mint tokens to user's wallet
    try {
      // Use ethers.js v6 syntax for parsing units
      const tokenAmount = ethers.parseUnits("250", 18)
      const tx = await mintTokens(normalizedAddress, tokenAmount)

      // Update the claim record with the actual transaction hash
      await checkAndRecordClaim(normalizedAddress, "record-complete", {
        txHash: tx.hash,
        timestamp: Date.now(),
      })

      return {
        success: true,
        message: "Successfully minted 250 tokens",
        txHash: tx.hash,
      }
    } catch (mintError: any) {
      // If minting fails, we should remove the pending claim
      await checkAndRecordClaim(normalizedAddress, "record-failed", {
        txHash: "failed",
        timestamp: Date.now(),
      })

      console.error("Token minting failed:", mintError)
      return {
        success: false,
        error: "Failed to mint tokens: " + (mintError.message || "Unknown error"),
      }
    }
  } catch (error: any) {
    console.error("Error in verifyAndMint:", error)
    return {
      success: false,
      error: error.message || "Failed to verify and mint tokens",
    }
  }
}
