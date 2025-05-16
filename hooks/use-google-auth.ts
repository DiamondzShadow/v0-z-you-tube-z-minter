"use client"

import { useState, useCallback, useEffect } from "react"

interface GoogleUser {
  email: string
  name: string
  picture?: string
}

export function useGoogleAuth() {
  const [user, setUser] = useState<GoogleUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  const login = useCallback(async () => {
    if (!mounted || typeof window === "undefined") return

    setIsLoading(true)
    setError(null)

    try {
      // Load the Google API client
      if (!window.google) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script")
          script.src = "https://accounts.google.com/gsi/client"
          script.onload = () => resolve()
          document.body.appendChild(script)
        })
      }

      // Initialize Google OAuth
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        scope: "https://www.googleapis.com/auth/youtube.readonly email profile",
        callback: async (response: any) => {
          if (response.error) {
            setError(response.error)
            setIsLoading(false)
            return
          }

          // Get access token
          const accessToken = response.access_token
          setToken(accessToken)

          // Get user info
          const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })

          const userData = await userInfoResponse.json()
          setUser({
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
          })

          setIsLoading(false)
        },
      })

      client.requestAccessToken()
    } catch (err: any) {
      setError(err.message || "Failed to login with Google")
      setIsLoading(false)
    }
  }, [mounted])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
  }, [])

  return {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
  }
}

// Add type definition for Google API
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void
          }
        }
      }
    }
  }
}
