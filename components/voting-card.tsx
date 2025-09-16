"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, Users, CheckCircle } from "lucide-react"

interface Poll {
  id: number
  title: string
  description: string
  status: "active" | "ended"
  endDate: string
  totalVotes: number
  options: Array<{
    id: number
    text: string
    votes: number
    percentage: number
  }>
}

interface VotingCardProps {
  poll: Poll
  selectedOption?: number
  onVoteSelect: (pollId: number, optionId: number) => void
  onVoteSubmit: (poll: Poll) => void
}

export function VotingCard({ poll, selectedOption, onVoteSelect, onVoteSubmit }: VotingCardProps) {
  const isActive = poll.status === "active"
  const hasVoted = selectedOption !== undefined

  return (
    <Card className={`transition-all duration-200 ${isActive ? "hover:shadow-lg border-2" : "opacity-75"}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 text-balance">{poll.title}</CardTitle>
            <CardDescription className="text-pretty">{poll.description}</CardDescription>
          </div>
          <Badge variant={isActive ? "default" : "secondary"} className="ml-4">
            {isActive ? "Active" : "Ended"}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Ends {new Date(poll.endDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{poll.totalVotes.toLocaleString()} votes</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isActive ? (
          <div className="space-y-4">
            <RadioGroup
              value={selectedOption?.toString()}
              onValueChange={(value) => onVoteSelect(poll.id, Number.parseInt(value))}
            >
              {poll.options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={option.id.toString()} id={`${poll.id}-${option.id}`} />
                  <Label htmlFor={`${poll.id}-${option.id}`} className="flex-1 cursor-pointer text-sm font-medium">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button onClick={() => onVoteSubmit(poll)} disabled={!hasVoted} className="w-full" size="lg">
              {hasVoted ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Vote
                </>
              ) : (
                "Select an Option"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground mb-4">Final Results:</p>
            {poll.options.map((option) => (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{option.text}</span>
                  <span className="text-sm text-muted-foreground">
                    {option.votes} votes ({option.percentage}%)
                  </span>
                </div>
                <Progress value={option.percentage} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
