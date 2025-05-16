"use server"

import { ethers } from "ethers"
import { getSubscriptionStatus } from "./youtube"
import { mintTokens } from "./blockchain"
import { checkAndRecordClaim } from "./database"

export async function verifyAndMint(walletAddress: string, googleAccessToken: string) {
  try {
    // Check if wallet has already claimed
    const existingClaim = await checkAndRecordClaim(walletAddress, "check")
    if (existingClaim) {
      return {
        success: true,
        message: "Tokens already claimed",
        txHash: existingClaim.txHash,
        alreadyClaimed: true,
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

    // Mint tokens to user's wallet
    try {
      // Use ethers.js v6 syntax for parsing units
      const tokenAmount = ethers.parseUnits("250", 18)
      const tx = await mintTokens(walletAddress, tokenAmount)

      // Record the claim in the database
      await checkAndRecordClaim(walletAddress, "record", {
        txHash: tx.hash,
        timestamp: Date.now(),
      })

      return {
        success: true,
        message: "Successfully minted 250 tokens",
        txHash: tx.hash,
      }
    } catch (mintError: any) {
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
