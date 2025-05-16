import type { Metadata } from "next"
import YouTubeMinter from "@/components/youtube-minter"

export const metadata: Metadata = {
  title: "YouTube Subscription Token Minter",
  description: "Subscribe to our YouTube channel and claim your tokens",
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="max-w-md w-full">
        <YouTubeMinter />
      </div>
    </main>
  )
}
