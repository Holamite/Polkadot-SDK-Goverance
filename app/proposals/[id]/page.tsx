"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Clock, Users, Calendar, CheckCircle, XCircle, AlertCircle, ArrowLeft, VoteIcon, BarChart3 } from "lucide-react"
import { useProposal } from "@/hooks/use-proposals"
import { proposalStore } from "@/lib/proposal-store"
import { userStore } from "@/lib/user-store"
import { usePolkadotReferenda } from "@/hooks/use-polkadot-referenda"
import Link from "next/link"

export default function ProposalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const proposalId = params.id as string
  const { proposal, loading } = useProposal(proposalId)
  const { fetchReferendumDetails } = usePolkadotReferenda()

  const [selectedOption, setSelectedOption] = useState("")
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState<string | null>(null)
  const [referendumDetails, setReferendumDetails] = useState<any>(null)
  const [referendumLoading, setReferendumLoading] = useState(false)

  // Simulate user ID (in real app, this would come from auth)
  const userId = "user-" + Math.random().toString(36).substr(2, 9)

  // Fetch referendum details if proposal has a referendumId or if we can determine it from URL
  useEffect(() => {
    const fetchReferendum = async () => {
      // Check if proposal has referendumId or if we can extract it from URL
      const referendumId = proposal?.referendumId || 
        (proposalId && proposalId.startsWith('referendum-') ? parseInt(proposalId.replace('referendum-', '')) : null)
      
      // For testing purposes, let's also check if we can get referendum info from URL params
      const urlParams = new URLSearchParams(window.location.search)
      const testReferendumId = urlParams.get('referendumId')
      
      const finalReferendumId = referendumId || (testReferendumId ? parseInt(testReferendumId) : null)
      
      if (finalReferendumId && !referendumDetails) {
        setReferendumLoading(true)
        try {
          console.log("Fetching referendum details for ID:", finalReferendumId)
          const details = await fetchReferendumDetails(finalReferendumId)
          setReferendumDetails(details)
          console.log("Referendum details:", details)
        } catch (error) {
          console.error("Failed to fetch referendum details:", error)
        } finally {
          setReferendumLoading(false)
        }
      }
    }

    fetchReferendum()
  }, [proposal?.referendumId, proposalId, referendumDetails, fetchReferendumDetails])

  // Check if user has already voted and track proposal view
  useState(() => {
    if (proposal) {
      const voted = proposalStore.hasUserVoted(proposal.id, userId)
      setHasVoted(voted)
      if (voted) {
        setUserVote(proposalStore.getUserVote(proposal.id, userId))
      }

      userStore.addActivity({
        userId,
        type: "proposal_viewed",
        proposalId: proposal.id,
        proposalTitle: proposal.title,
      })
    }
  })

  const handleVote = async () => {
    if (!selectedOption || !proposal) return

    setIsVoting(true)

    // Simulate voting delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const success = proposalStore.vote(proposal.id, selectedOption, userId)

    if (success) {
      setHasVoted(true)
      setUserVote(selectedOption)

      userStore.addActivity({
        userId,
        type: "vote",
        proposalId: proposal.id,
        proposalTitle: proposal.title,
        details: `Voted: ${selectedOption}`,
      })
    }

    setIsVoting(false)
  }

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
        return <Clock className="h-4 w-4" />
      case "ended":
        return <XCircle className="h-4 w-4" />
      case "executed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()

    if (diff <= 0) return "Voting has ended"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days} days, ${hours} hours remaining`
    if (hours > 0) return `${hours} hours, ${minutes} minutes remaining`
    return `${minutes} minutes remaining`
  }

  const getVoteResults = () => {
    if (!proposal) return {}
    return proposalStore.getVoteResults(proposal.id)
  }

  const voteResults = getVoteResults()
  const totalVotes = Object.values(voteResults).reduce((sum, count) => sum + count, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading proposal...</p>
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Proposal Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The proposal you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/proposals">
              <Button>Back to Proposals</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isActive = proposal.status === "active" && new Date() <= proposal.endDate
  const canVote = isActive && !hasVoted

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/proposals"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Proposals
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Proposal Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(proposal.status)} flex items-center gap-1`}>
                        {getStatusIcon(proposal.status)}
                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </Badge>
                      <Badge variant="outline">{proposal.proposalType}</Badge>
                    </div>
                  </div>
                  <CardTitle className="text-2xl leading-tight">{proposal.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{proposal.description}</CardDescription>
                </CardHeader>
              </Card>

              {/* Referendum Status Section */}
              {(proposal?.referendumId || referendumDetails) && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          On-Chain Referendum Status
                        </CardTitle>
                        <CardDescription>
                          This proposal has been submitted to the Paseo blockchain as referendum #{proposal?.referendumId || referendumDetails?.id}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const referendumId = proposal?.referendumId || referendumDetails?.id
                          if (referendumId) {
                            setReferendumLoading(true)
                            try {
                              const details = await fetchReferendumDetails(referendumId)
                              setReferendumDetails(details)
                            } catch (error) {
                              console.error("Failed to refresh referendum details:", error)
                            } finally {
                              setReferendumLoading(false)
                            }
                          }
                        }}
                        disabled={referendumLoading}
                      >
                        {referendumLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          "Refresh"
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {referendumLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Loading referendum details...
                      </div>
                    ) : referendumDetails ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Referendum ID</Label>
                            <p className="text-lg font-semibold">#{referendumDetails.id}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                            <Badge variant="outline" className="mt-1">
                              {referendumDetails.status || "Unknown"}
                            </Badge>
                          </div>
                        </div>
                        
                        {referendumDetails.details && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">On-Chain Title</Label>
                            <p className="text-sm mt-1">{referendumDetails.details.title}</p>
                          </div>
                        )}

                        {proposal.trackId && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Track ID</Label>
                            <p className="text-sm mt-1">{proposal.trackId}</p>
                          </div>
                        )}

                        {proposal.onChainStatus && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Chain Status</Label>
                            <Badge variant="secondary" className="mt-1">
                              {proposal.onChainStatus}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        <p>Referendum #{proposal?.referendumId || referendumDetails?.id} exists on-chain</p>
                        <p className="text-sm mt-1">Unable to fetch detailed status at this time</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Voting Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <VoteIcon className="h-5 w-5 text-primary" />
                    {canVote ? "Cast Your Vote" : hasVoted ? "Your Vote" : "Voting Results"}
                  </CardTitle>
                  <CardDescription>
                    {canVote && "Select your preferred option and submit your vote"}
                    {hasVoted && `You voted: ${userVote}`}
                    {!isActive && "Voting has ended. View the final results below."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {canVote ? (
                    <div className="space-y-4">
                      <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                        {proposal.options.map((option, index) => (
                          <div
                            key={option}
                            className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <RadioGroupItem value={option} id={`option-${index}`} />
                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-medium">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      <Button onClick={handleVote} disabled={!selectedOption || isVoting} className="w-full" size="lg">
                        {isVoting ? "Submitting Vote..." : "Submit Vote"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {proposal.options.map((option) => {
                        const votes = voteResults[option] || 0
                        const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
                        const isUserVote = userVote === option

                        return (
                          <div
                            key={option}
                            className={`p-4 rounded-lg border ${isUserVote ? "border-primary bg-primary/5" : "border-border"}`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium flex items-center gap-2">
                                {option}
                                {isUserVote && (
                                  <Badge variant="secondary" className="text-xs">
                                    Your Vote
                                  </Badge>
                                )}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {votes} votes ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Proposal Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Proposal Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Total Votes
                    </div>
                    <span className="font-semibold">{totalVotes}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Quorum Required
                    </div>
                    <span className="font-semibold">{proposal.quorumThreshold}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Time Remaining
                    </div>
                    <span className="font-semibold text-sm">{formatTimeRemaining(proposal.endDate)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Governance Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle>Governance Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{proposal.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Voting Period</span>
                    <span>{proposal.votingPeriod} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Execution Delay</span>
                    <span>{proposal.executionDelay} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Proposal ID</span>
                    <span className="font-mono text-xs">{proposal.id}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
