"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock, Users, VoteIcon } from "lucide-react"
import { VotingCard } from "@/components/voting-card"
import { VoteConfirmationDialog } from "@/components/vote-confirmation-dialog"

// Mock data for polls
const polls = [
  {
    id: 1,
    title: "City Budget Allocation 2024",
    description: "How should the city allocate its budget for the upcoming year?",
    status: "active" as const,
    endDate: "2024-12-31",
    totalVotes: 1247,
    options: [
      { id: 1, text: "Education & Schools", votes: 456, percentage: 36.6 },
      { id: 2, text: "Infrastructure & Roads", votes: 389, percentage: 31.2 },
      { id: 3, text: "Healthcare Services", votes: 234, percentage: 18.8 },
      { id: 4, text: "Environmental Programs", votes: 168, percentage: 13.5 },
    ],
  },
  {
    id: 2,
    title: "Community Park Development",
    description: "What type of facilities should be prioritized in the new community park?",
    status: "active" as const,
    endDate: "2024-11-15",
    totalVotes: 892,
    options: [
      { id: 1, text: "Playground & Family Area", votes: 312, percentage: 35.0 },
      { id: 2, text: "Sports Courts & Fields", votes: 267, percentage: 29.9 },
      { id: 3, text: "Walking Trails & Gardens", votes: 201, percentage: 22.5 },
      { id: 4, text: "Community Center Building", votes: 112, percentage: 12.6 },
    ],
  },
  {
    id: 3,
    title: "Public Transportation Initiative",
    description: "Which transportation improvement should be implemented first?",
    status: "ended" as const,
    endDate: "2024-10-01",
    totalVotes: 2156,
    options: [
      { id: 1, text: "Electric Bus Fleet", votes: 864, percentage: 40.1 },
      { id: 2, text: "Bike Lane Network", votes: 647, percentage: 30.0 },
      { id: 3, text: "Light Rail Extension", votes: 431, percentage: 20.0 },
      { id: 4, text: "Ride Share Program", votes: 214, percentage: 9.9 },
    ],
  },
]

export default function VotePage() {
  const [selectedVotes, setSelectedVotes] = useState<Record<number, number>>({})
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [currentPoll, setCurrentPoll] = useState<(typeof polls)[0] | null>(null)

  const handleVoteSelect = (pollId: number, optionId: number) => {
    setSelectedVotes((prev) => ({
      ...prev,
      [pollId]: optionId,
    }))
  }

  const handleVoteSubmit = (poll: (typeof polls)[0]) => {
    setCurrentPoll(poll)
    setShowConfirmation(true)
  }

  const confirmVote = () => {
    if (currentPoll) {
      // Here you would typically send the vote to your backend
      console.log(`Vote submitted for poll ${currentPoll.id}, option ${selectedVotes[currentPoll.id]}`)
      setShowConfirmation(false)
      setCurrentPoll(null)
      // Remove the vote from selectedVotes to show it as submitted
      setSelectedVotes((prev) => {
        const newVotes = { ...prev }
        delete newVotes[currentPoll.id]
        return newVotes
      })
    }
  }

  const activePollsCount = polls.filter((poll) => poll.status === "active").length
  const totalParticipants = polls.reduce((sum, poll) => sum + poll.totalVotes, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <VoteIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground text-balance">Active Polls</h1>
            <p className="text-muted-foreground">Make your voice heard on important community decisions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activePollsCount}</p>
                  <p className="text-sm text-muted-foreground">Active Polls</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalParticipants.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Participants</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{Object.keys(selectedVotes).length}</p>
                  <p className="text-sm text-muted-foreground">Votes Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Polls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {polls.map((poll) => (
          <VotingCard
            key={poll.id}
            poll={poll}
            selectedOption={selectedVotes[poll.id]}
            onVoteSelect={handleVoteSelect}
            onVoteSubmit={handleVoteSubmit}
          />
        ))}
      </div>

      {/* Vote Confirmation Dialog */}
      <VoteConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        poll={currentPoll}
        selectedOption={currentPoll ? selectedVotes[currentPoll.id] : undefined}
        onConfirm={confirmVote}
      />
    </div>
  )
}
