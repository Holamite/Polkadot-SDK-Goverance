"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Gavel, Clock, Vote, Link, Coins } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
// Removed local storage imports - only using chain submission
import { usePolkadotReferenda } from "@/hooks/use-polkadot-referenda"

// Dynamic import to avoid SSR issues
const getPolkadotAPI = async () => {
  if (typeof window === 'undefined') return null
  const { polkadotAPI } = await import("@/lib/polkadot-api")
  return polkadotAPI
}

interface ProposalOption {
  id: string
  text: string
}

export default function CreateProposalPage() {
  const router = useRouter()
  const { createSpenderReferendum, createRemarkReferendum, initialized, initializeClient, loading: apiLoading } = usePolkadotReferenda()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [proposalType, setProposalType] = useState("")
  const [options, setOptions] = useState<ProposalOption[]>([
    { id: "1", text: "For" },
    { id: "2", text: "Against" },
    { id: "3", text: "Abstain" },
  ])
  const [newOption, setNewOption] = useState("")
  const [votingPeriod, setVotingPeriod] = useState("7")
  const [quorumThreshold, setQuorumThreshold] = useState("10")
  const [executionDelay, setExecutionDelay] = useState("2")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTransactionPending, setIsTransactionPending] = useState(false)
  const [beneficiaryAddress, setBeneficiaryAddress] = useState("")
  const [amount, setAmount] = useState("")

  const addOption = () => {
    if (newOption.trim() && options.length < 6) {
      setOptions([...options, { id: Date.now().toString(), text: newOption.trim() }])
      setNewOption("")
    }
  }

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((option) => option.id !== id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setIsTransactionPending(true)

    try {
      // Validate required fields
      if (!title || !description || !proposalType) {
        throw new Error("Please fill in all required fields")
      }

      if (!initialized) {
        console.log("Polkadot API not initialized, attempting to initialize...")
        try {
          await initializeClient()
          console.log("Initialization attempt completed")
        } catch (initError) {
          console.error("Initialization failed:", initError)
          throw new Error(`Polkadot API initialization failed: ${initError instanceof Error ? initError.message : "Unknown error"}`)
        }
      }

      const polkadotAPI = await getPolkadotAPI()
      if (!polkadotAPI) {
        throw new Error("Polkadot API not available")
      }

      // Connect wallet and get accounts
      const accounts = await polkadotAPI.connectWallet()
      if (!accounts || accounts.length === 0) {
        throw new Error("No wallet accounts found. Please connect your wallet.")
      }

      // Use the first account as default
      const selectedAccount = accounts[0]
      polkadotAPI.setSelectedAccount(selectedAccount)

      // Import the signer from the extension
      const { web3FromAddress } = await import("@polkadot/extension-dapp")
      const injector = await web3FromAddress(selectedAccount.address)
      
      if (!injector.signer) {
        throw new Error("No signer available from wallet")
      }

      console.log("Starting chain transaction...")
      let referendumInfo
      
      if (proposalType === "Treasury Management") {
        if (!beneficiaryAddress || !amount) {
          throw new Error("Treasury Management requires beneficiary address and amount")
        }
        // Create spender referendum
        const amountBigInt = BigInt(Number.parseFloat(amount) * 1e10) // Convert to Planck units
        referendumInfo = await createSpenderReferendum(beneficiaryAddress, amountBigInt, injector.signer, selectedAccount.address)
      } else {
        // Create remark referendum
        referendumInfo = await createRemarkReferendum(description, injector.signer, selectedAccount.address)
      }

      if (!referendumInfo) {
        throw new Error("Transaction failed - no referendum info returned")
      }

      console.log("Chain transaction successful:", referendumInfo)
      
      // Show success message with referendum details
            alert(`✅ Proposal successfully submitted to Paseo chain!\n\nReferendum ID: ${referendumInfo.index}\nTrack: ${referendumInfo.track}\n\nYour proposal is now live on the blockchain!`)
      
      router.push("/proposals")
    } catch (error) {
      console.error("Failed to create proposal:", error)
      
      // Show error message to user
      alert(`❌ Failed to create proposal: ${error instanceof Error ? error.message : "Unknown error"}\n\nPlease check your wallet connection and try again.`)
    } finally {
      setIsSubmitting(false)
      setIsTransactionPending(false)
    }
  }

  const proposalTypes = [
    "Treasury Management",
    "Protocol Upgrade",
    "Parameter Change",
    "Grant Proposal",
    "Partnership Agreement",
    "Governance Change",
    "Emergency Action",
    "Community Initiative",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Create Governance Proposal</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Submit a proposal for community voting. Shape the future of our DAO through democratic decision-making.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gavel className="h-5 w-5 text-primary" />
                      Proposal Details
                    </CardTitle>
                    <CardDescription>Provide comprehensive information about your governance proposal</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Proposal Title *</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Increase Treasury Allocation for Development Fund"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Proposal Description *</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide detailed rationale, implementation plan, expected outcomes, and any relevant data or research supporting this proposal..."
                        required
                        rows={6}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="proposalType">Proposal Type *</Label>
                      <Select value={proposalType} onValueChange={setProposalType}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select proposal category" />
                        </SelectTrigger>
                        <SelectContent>
                          {proposalTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Vote className="h-5 w-5 text-primary" />
                      Voting Options
                    </CardTitle>
                    <CardDescription>
                      Define the voting choices for token holders (typically For/Against/Abstain)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {options.map((option, index) => (
                        <div key={option.id} className="flex items-center gap-2">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <Input
                            value={option.text}
                            onChange={(e) => {
                              const updated = options.map((opt) =>
                                opt.id === option.id ? { ...opt, text: e.target.value } : opt,
                              )
                              setOptions(updated)
                            }}
                            className="flex-1"
                          />
                          {options.length > 2 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(option.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {options.length < 6 && (
                      <div className="flex gap-2">
                        <Input
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          placeholder="Add alternative option..."
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addOption())}
                        />
                        <Button type="button" onClick={addOption} disabled={!newOption.trim()}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Governance Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="votingPeriod">Voting Period (days)</Label>
                      <Select value={votingPeriod} onValueChange={setVotingPeriod}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quorum">Quorum Threshold (%)</Label>
                      <Select value={quorumThreshold} onValueChange={setQuorumThreshold}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="10">10%</SelectItem>
                          <SelectItem value="15">15%</SelectItem>
                          <SelectItem value="20">20%</SelectItem>
                          <SelectItem value="25">25%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="execution">Execution Delay (days)</Label>
                      <Select value={executionDelay} onValueChange={setExecutionDelay}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Immediate</SelectItem>
                          <SelectItem value="1">1 day</SelectItem>
                          <SelectItem value="2">2 days</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link className="h-5 w-5 text-primary" />
                      Blockchain Submission
                    </CardTitle>
            <CardDescription>
              This proposal will be submitted directly to the Paseo blockchain as a referendum
            </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground">
                        {isTransactionPending && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            Transaction in progress...
                          </div>
                        )}
                        {!isTransactionPending && !initialized && (
                          <div className="space-y-2">
                            <p className="text-amber-600">⚠️ Polkadot connection not initialized</p>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              disabled={apiLoading}
                              onClick={async () => {
                                console.log("Initialize Connection button clicked")
                                try {
                                  console.log("Calling initializeClient...")
                                  await initializeClient()
                                  console.log("initializeClient completed successfully")
                                } catch (error) {
                                  console.error("Manual initialization failed:", error)
                                  alert(`Initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`)
                                }
                              }}
                            >
                              {apiLoading ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                  Initializing...
                                </div>
                              ) : (
                                "Initialize Connection"
                              )}
                            </Button>
                          </div>
                        )}
                        {!isTransactionPending && initialized && (
                          <p className="text-green-600">✅ Connected to Paseo</p>
                        )}
                      </div>
                      
                      {proposalType === "Treasury Management" && (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="beneficiaryAddress" className="text-sm">
                              Beneficiary Address
                            </Label>
                            <Input
                              id="beneficiaryAddress"
                              value={beneficiaryAddress}
                              onChange={(e) => setBeneficiaryAddress(e.target.value)}
                              placeholder="Enter Paseo address..."
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="amount" className="text-sm">
                              Amount (WND)
                            </Label>
                            <Input
                              id="amount"
                              type="number"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="Enter amount in PASE..."
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        <p>• Treasury proposals will create spend referenda</p>
                        <p>• Other proposals will create remark referenda</p>
                        <p>• Requires wallet connection and PASE tokens for fees</p>
                        <p className="text-green-600 font-medium">• Proposal will be stored on the blockchain only</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Proposal Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm">{title || "Proposal Title"}</h3>
                      <p className="text-xs text-muted-foreground">
                        {description || "Proposal description and rationale will appear here..."}
                      </p>
                      {proposalType && (
                        <Badge variant="secondary" className="text-xs">
                          {proposalType}
                        </Badge>
                      )}
                      <div className="text-xs text-muted-foreground">
                        <p>Voting Period: {votingPeriod} days</p>
                        <p>Quorum: {quorumThreshold}%</p>
                        <p>Execution Delay: {executionDelay} days</p>
                        <div className="space-y-1">
                          <p className="text-blue-600">🔗 Will be submitted to Westend blockchain</p>
                          <p className="text-green-600 text-xs">✅ Stored directly on the blockchain</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {options.map((option, index) => (
                          <div key={option.id} className="text-xs p-2 bg-muted rounded">
                            {index + 1}. {option.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={!title || !description || !proposalType || isSubmitting || isTransactionPending}
                >
                  {isTransactionPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting to Blockchain...
                    </div>
                  ) : isSubmitting ? (
                    "Submitting to Blockchain..."
                  ) : (
                    "Submit to Blockchain"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
