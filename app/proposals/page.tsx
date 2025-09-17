"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Users, Vote, Search, Filter, Calendar, CheckCircle, XCircle, RefreshCw, Link as LinkIcon } from "lucide-react"
import { useProposals } from "@/hooks/use-proposals"
import { proposalStore } from "@/lib/proposal-store"
import { usePolkadotReferenda } from "@/hooks/use-polkadot-referenda"
import { PolkadotReferendaCard } from "@/components/polkadot-referenda-card"
import Link from "next/link"
import { useEffect } from "react"

export default function ProposalsPage() {
  const { proposals, loading } = useProposals()
  const { referenda, ongoingReferenda, initialized, fetchReferenda, initializeClient } = usePolkadotReferenda()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [showBlockchainProposals, setShowBlockchainProposals] = useState(true)

  // Manual initialization on page load
  useEffect(() => {
    console.log("Proposals page: useEffect triggered, initialized:", initialized)
    if (!initialized) {
      console.log("Proposals page: Not initialized, calling initializeClient...")
      initializeClient()
    }
  }, [initialized, initializeClient])

  // Convert blockchain referenda to proposal-like objects
  const convertReferendaToProposals = (referendaList: any[]) => {
    return referendaList.map((referendum) => ({
      id: `referendum-${referendum.id}`,
      title: referendum.details?.title || referendum.title || `Referendum #${referendum.id}`,
      description: referendum.description || "Blockchain referendum",
      proposalType: "Blockchain Referendum",
      category: "Governance",
      votingPeriod: 0, // Will be determined by blockchain
      quorumThreshold: 0,
      executionDelay: 0,
      options: ["Approve", "Reject"],
      rationale: "On-chain governance proposal",
      implementation: "Executed on blockchain",
      createdAt: new Date(), // Approximate
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: referendum.status === "Ongoing" ? "active" : "ended",
      votes: {},
      totalVotes: 0,
      referendumId: referendum.id,
      trackId: referendum.track?.id,
      onChainStatus: referendum.status,
      beneficiaryAddress: undefined,
      amount: undefined,
      callData: undefined,
    }))
  }

  // Combine local proposals with blockchain referenda
  const allProposals = [
    ...proposals,
    ...(showBlockchainProposals ? convertReferendaToProposals(ongoingReferenda) : [])
  ]

  // Debug logging
  console.log("Proposals page debug:")
  console.log("- Local proposals:", proposals.length)
  console.log("- Ongoing referenda:", ongoingReferenda.length)
  console.log("- Show blockchain:", showBlockchainProposals)
  console.log("- All proposals:", allProposals.length)
  console.log("- Initialized:", initialized)

  // Sync local proposals with on-chain referenda status
  useEffect(() => {
    if (initialized && referenda.length > 0) {
      referenda.forEach((referendum) => {
        const localProposal = proposalStore.getProposalsByReferendumId(referendum.id)
        if (localProposal) {
          proposalStore.syncWithOnChainStatus(localProposal.id, referendum.status)
        }
      })
    }
  }, [initialized, referenda])

  const filteredProposals = allProposals.filter((proposal) => {
    const matchesSearch =
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || proposal.status === statusFilter
    const matchesType = typeFilter === "all" || proposal.proposalType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "ended":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "executed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-3 w-3" />
      case "ended":
        return <XCircle className="h-3 w-3" />
      case "executed":
        return <CheckCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()

    if (diff <= 0) return "Ended"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h remaining`
    return `${hours}h remaining`
  }

  const getVoteResults = (proposalId: string) => {
    return proposalStore.getVoteResults(proposalId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading proposals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-4xl font-bold text-foreground">Governance Proposals</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!initialized) {
                    console.log("Manual initialization triggered from button")
                    await initializeClient()
                  } else {
                    console.log("Manual fetch triggered from button")
                    await fetchReferenda()
                  }
                }}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {initialized ? "Sync Chain" : "Initialize & Sync"}
              </Button>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Review and vote on active proposals that shape our DAO's future
            </p>
            {initialized && (
              <p className="text-sm text-green-600 mt-2">
                ✅ Connected to Polkadot - {ongoingReferenda.length} active referenda
              </p>
            )}
          </div>

          {/* Filters and Search */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search proposals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="executed">Executed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Treasury Management">Treasury</SelectItem>
                  <SelectItem value="Protocol Upgrade">Protocol</SelectItem>
                  <SelectItem value="Parameter Change">Parameters</SelectItem>
                  <SelectItem value="Grant Proposal">Grants</SelectItem>
                  <SelectItem value="Partnership Agreement">Partnerships</SelectItem>
                  <SelectItem value="Governance Change">Governance</SelectItem>
                  <SelectItem value="Blockchain Referendum">Blockchain Referendum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Blockchain Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showBlockchain"
                  checked={showBlockchainProposals}
                  onChange={(e) => setShowBlockchainProposals(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="showBlockchain" className="text-sm font-medium">
                  Show blockchain referenda ({ongoingReferenda.length})
                </label>
              </div>
              {!initialized && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Initialize connection
                    console.log("Initialize blockchain connection")
                  }}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Connect to Blockchain
                </Button>
              )}
            </div>
          </div>

          {/* Proposals Grid */}
          {filteredProposals.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No proposals found</h3>
                <p className="text-muted-foreground mb-4">
                  {proposals.length === 0
                    ? "No proposals have been created yet. Be the first to submit one!"
                    : "No proposals match your current filters."}
                </p>
                <Link href="/create">
                  <Button>Create First Proposal</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProposals.map((proposal) => {
                const voteResults = getVoteResults(proposal.id)
                const totalVotes = Object.values(voteResults).reduce((sum, count) => sum + count, 0)

                return (
                  <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-2">
                          <Badge className={`${getStatusColor(proposal.status)} flex items-center gap-1`}>
                            {getStatusIcon(proposal.status)}
                            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                          </Badge>
                          {proposal.referendumId && (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <LinkIcon className="h-3 w-3" />
                              Referendum #{proposal.referendumId}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {proposal.proposalType}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight">{proposal.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{proposal.description}</CardDescription>
                      {proposal.onChainStatus && (
                        <div className="text-xs text-muted-foreground mt-2">
                          <span className="font-medium">Chain Status:</span> {proposal.onChainStatus}
                          {proposal.trackId && (
                            <span className="ml-2">Track: {proposal.trackId}</span>
                          )}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatTimeRemaining(proposal.endDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {totalVotes} votes
                        </div>
                      </div>

                      {totalVotes > 0 && (
                        <div className="space-y-2">
                          {Object.entries(voteResults).map(([option, count]) => {
                            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0
                            return (
                              <div key={option} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>{option}</span>
                                  <span>
                                    {count} ({percentage.toFixed(1)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5">
                                  <div
                                    className="bg-primary h-1.5 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      <Link href={`/proposals/${proposal.id}`}>
                        <Button className="w-full" variant={proposal.status === "active" ? "default" : "outline"}>
                          {proposal.status === "active" ? "Vote Now" : "View Results"}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Polkadot Referenda Section */}
          {initialized && ongoingReferenda.length > 0 && (
            <div className="mt-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-4">Active Polkadot Referenda</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Live referenda from the Polkadot governance system
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ongoingReferenda.map((referendum) => (
                  <PolkadotReferendaCard
                    key={referendum.id}
                    referendum={referendum}
                    onViewDetails={(referendum) => {
                      console.log("View referendum details:", referendum)
                      // You can implement a modal or navigation here
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
