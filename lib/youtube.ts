"use server"

export async function getSubscriptionStatus(accessToken: string): Promise<boolean> {
  try {
    const channelId = process.env.YOUTUBE_CHANNEL_ID

    if (!channelId) {
      console.warn("YouTube channel ID is not defined in environment variables")
      // For development, return true to simulate a successful subscription
      return true
    }

    // Simple development mode check
    if (process.env.NODE_ENV !== "production") {
      console.log("Development mode: Simulating successful subscription")
      return true
    }

    // Make the API call to check subscription status
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&forChannelId=${channelId}&mine=true`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.items && data.items.length > 0
    } catch (apiError) {
      console.error("YouTube API error:", apiError)
      // In case of API error in development, return true
      if (process.env.NODE_ENV !== "production") {
        return true
      }
      throw apiError
    }
  } catch (error) {
    console.error("Error checking subscription status:", error)
    throw error
  }
}
