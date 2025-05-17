import type { Metadata } from "next"
import YouTubeMinter from "@/components/youtube-minter"
import { FAQSection } from "@/components/faq-section"

export const metadata: Metadata = {
  title: "Diamond zShadow DIAMD Token Minter",
  description: "Subscribe to our YouTube channel and claim your DIAMD tokens",
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="max-w-md w-full">
        <YouTubeMinter />
        <FAQSection />
      </div>
    </main>
  )
}
