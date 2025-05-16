import type { Metadata } from "next"
import TransactionHistory from "@/components/transaction-history"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, History } from "lucide-react"

export const metadata: Metadata = {
  title: "Transaction History | YouTube Token Minter",
  description: "View your past token claims and transaction history",
}

export default function HistoryPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="max-w-4xl w-full">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Minter
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Transaction History
          </h1>
        </div>

        <TransactionHistory />
      </div>
    </main>
  )
}
