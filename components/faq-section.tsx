"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle } from "lucide-react"

export function FAQSection() {
  return (
    <Card className="w-full bg-zinc-800 border-zinc-700 mt-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <CardTitle>Frequently Asked Questions</CardTitle>
        </div>
        <CardDescription>
          Everything you need to know about the Diamond zShadow ecosystem and DIAMD token
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is Diamond zShadow?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                Diamond zShadow is a revolutionary Layer 3 blockchain ecosystem transforming the entertainment industry
                through comprehensive tokenization.
              </p>
              <p>
                We're making it possible to tokenize everything - from movies and music to comedy shows, fashion, and
                live streams, creating new opportunities for creators and fans alike.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>How do I claim DIAMD tokens?</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Connect your Ethereum wallet (MetaMask or other compatible wallets)</li>
                <li>Connect your Google account to verify your YouTube subscription</li>
                <li>Click the "Claim Tokens" button to receive your 250 DIAMD tokens</li>
              </ol>
              <p className="mt-2 text-amber-400">Remember: You can only claim once per wallet address!</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Who can claim DIAMD tokens?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                Only the first 1,000 subscribers to the nlockchain media YouTube channel can claim tokens. Once the
                channel reaches 1,000 subscribers, the token claim will be permanently closed.
              </p>
              <p className="font-medium text-primary">Be quick! This is a limited-time opportunity.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>How does the token minting work?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">The DIAMD token has a unique minting mechanism tied to YouTube views:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Tokens are minted for every 1,000 views on the nlockchain media channel</li>
                <li>The minting rate follows YouTube's creator monetization algorithm</li>
                <li>Each 5-9 minute video generates approximately $3-10 worth of tokens per 1,000 views</li>
              </ul>
              <p className="mt-2">This creates a direct link between content engagement and token value.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>What can I do with DIAMD tokens?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">DIAMD tokens have multiple utilities within the entertainment ecosystem:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <span className="font-medium">Governance:</span> Vote on proposals and help shape the future of
                  Diamond zShadow
                </li>
                <li>
                  <span className="font-medium">Staking:</span> Earn rewards by staking your tokens
                </li>
                <li>
                  <span className="font-medium">Access:</span> Unlock premium entertainment content
                </li>
                <li>
                  <span className="font-medium">Tokenization:</span> Participate in tokenized entertainment assets
                </li>
                <li>
                  <span className="font-medium">Network Fees:</span> Pay for transactions on the Diamond zShadow network
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>What is special about Diamond zShadow?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                Diamond zShadow is a Layer 3 blockchain ecosystem specifically designed for the entertainment industry.
                It enables comprehensive tokenization of entertainment assets and experiences.
              </p>
              <p>
                By focusing on entertainment, Diamond zShadow creates new opportunities for creators, producers, and
                fans to interact with and benefit from content in ways that weren't possible before blockchain
                technology.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>Why is the claim limited to 1,000 subscribers?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">The 1,000 subscriber limit serves multiple purposes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Creates scarcity and value for early supporters</li>
                <li>Ensures a fair initial distribution</li>
                <li>Incentivizes early channel growth</li>
                <li>Allows us to test and refine the tokenomics model</li>
              </ul>
              <p className="mt-2 text-primary">
                Early supporters are crucial to our project's success, and we want to reward them accordingly.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>How do I add the Diamond zShadow network to my wallet?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">To add the Diamond zShadow network to your MetaMask or other compatible wallet:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Open your wallet and go to Networks</li>
                <li>Click "Add Network"</li>
                <li>Enter the following details:</li>
              </ol>
              <div className="bg-zinc-900 p-3 rounded-md mt-2 font-mono text-sm">
                <p>Network Name: Diamond zShadow Chain</p>
                <p>RPC URL: https://rpc-diamondzshadow-rt5jq9kej1.conduit.xyz</p>
                <p>Chain ID: 32677</p>
                <p>Currency Symbol: DIAMD</p>
                <p>Block Explorer: https://explorer-diamondzshadow-rt5jq9kej1.conduit.xyz</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-9">
            <AccordionTrigger>What types of entertainment can be tokenized?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">Diamond zShadow enables tokenization across the entertainment spectrum:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Movies and film productions</li>
                <li>Music and audio content</li>
                <li>Comedy shows and performances</li>
                <li>Fashion events and products</li>
                <li>Live streams and interactive content</li>
                <li>Digital art and collectibles</li>
                <li>Gaming assets and experiences</li>
              </ul>
              <p className="mt-2">
                This comprehensive approach to tokenization creates new revenue streams and engagement models for
                creators and fans.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-10">
            <AccordionTrigger>How can I contact the team?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">You can reach the Diamond zShadow team through various channels:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  YouTube:{" "}
                  <a
                    href="https://youtube.com/nlockchainmedia"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    nlockchain media
                  </a>
                </li>
                <li>
                  Website:{" "}
                  <a
                    href="https://diamondzshadow.net"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    diamondzshadow.net
                  </a>
                </li>
                <li>
                  Discord:{" "}
                  <a
                    href="https://discord.gg/diamondzshadow"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Diamond zShadow Community
                  </a>
                </li>
                <li>Email: team@diamondzshadow.net</li>
              </ul>
              <p className="mt-2 text-xs text-zinc-400">
                Note: Please verify these contact details on the official website.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
