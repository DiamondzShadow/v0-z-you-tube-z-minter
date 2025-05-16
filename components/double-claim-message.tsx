"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Coffee, X } from "lucide-react"

// Array of witty responses for repeat claimers
const wittyResponses = [
  "Nice try! But these tokens are like potato chips - you can't have just one bag. Wait, actually you can only have one bag.",
  "Whoa there, token collector! You've already claimed your share. Save some blockchain for the rest of us!",
  "Token déjà vu! You've already claimed these digital treasures. No double-dipping in the crypto pool!",
  "Your wallet says: 'Been there, claimed that.' One claim per wallet, those are the rules!",
  "Looks like your wallet has a good memory - it remembers claiming these tokens already!",
  "Sorry, this isn't a buffet - it's one serving of tokens per wallet!",
  "Your wallet is already part of the token club! No need for a second membership.",
  "Token greed detected! Just kidding, but you have already claimed your tokens.",
  "Your wallet whispers: 'We've already got these tokens, what more do you want?'",
  "The blockchain never forgets! Your wallet has already claimed its tokens.",
]

interface DoubleClaimMessageProps {
  attemptCount?: number
  onDismiss?: () => void
}

export function DoubleClaimMessage({ attemptCount = 0, onDismiss }: DoubleClaimMessageProps) {
  const [message, setMessage] = useState("")

  // Get a random witty response when the component mounts
  useEffect(() => {
    const index = Math.floor(Math.random() * wittyResponses.length)
    let selectedMessage = wittyResponses[index]

    // Add extra humor for persistent users
    if (attemptCount >= 3) {
      selectedMessage = `${selectedMessage} Wow, you've tried ${attemptCount} times! Persistence is admirable, but maybe try a different wallet?`
    }

    setMessage(selectedMessage)
    console.log("Double claim message displayed:", selectedMessage)
  }, [attemptCount])

  return (
    <Alert className="bg-purple-900/20 border-purple-800 text-purple-300 relative mb-4">
      <Coffee className="h-4 w-4" />
      <AlertTitle>Already Claimed!</AlertTitle>
      <AlertDescription className="font-medium">{message}</AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 text-purple-400 hover:text-purple-300 hover:bg-purple-900/30"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  )
}
