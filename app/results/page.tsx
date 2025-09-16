"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Users, Clock, Award, Activity } from "lucide-react"
import { ResultsChart } from "@/components/results-chart"
import { ParticipationChart } from "@/components/participation-chart"

// Mock data for results
const pollResults = [
  {
    id: 1,
    title: "City Budget Allocation 2024",
    description: "How should the city allocate its budget for the upcoming year?",
    status: "active" as const,
    endDate: "2024-12-31",
    totalVotes: 1247,
    options: [
      { id: 1, text: "Education & Schools", votes: 456, percentage: 36.6, color: "hsl(var(--chart-1))" },
      { id: 2, text: "Infrastructure & Roads", votes: 389, percentage: 31.2, color: "hsl(var(--chart-2))" },
      { id: 3, text: "Healthcare Services", votes: 234, percentage: 18.8, color: "hsl(var(--chart-3))" },
      { id: 4, text: "Environmental Programs", votes: 168, percentage: 13.5, color: "hsl(var(--chart-4))" },
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
      { id: 1, text: "Playground & Family Area", votes: 312, percentage: 35.0, color: "hsl(var(--chart-1))" },
      { id: 2, text: "Sports Courts & Fields", votes: 267, percentage: 29.9, color: "hsl(var(--chart-2))" },
      { id: 3, text: "Walking Trails & Gardens", votes: 201, percentage: 22.5, color: "hsl(var(--chart-3))" },
      { id: 4, text: "Community Center Building", votes: 112, percentage: 12.6, color: "hsl(var(--chart-4))" },
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
      { id: 1, text: "Electric Bus Fleet", votes: 864, percentage: 40.1, color: "hsl(var(--chart-1))" },
      { id: 2, text: "Bike Lane Network", votes: 647, percentage: 30.0, color: "hsl(var(--chart-2))" },
      { id: 3, text: "Light Rail Extension", votes: 431, percentage: 20.0, color: "hsl(var(--chart-3))" },
      { id: 4, text: "Ride Share Program", votes: 214, percentage: 9.9, color: "hsl(var(--chart-4))" },
    ],
  },
]

const participationData = [
  { month: "Jan", votes: 1200 },
  { month: "Feb", votes: 1450 },
  { month: "Mar", votes: 1800 },
  { month: "Apr", votes: 1650 },
  { month: "May", votes: 2100 },
  { month: "Jun", votes: 2400 },
  { month: "Jul", votes: 2200 },
  { month: "Aug", votes: 2800 },
  { month: "Sep", votes: 3200 },
  { month: "Oct", votes: 2900 },
  { month: "Nov", votes: 3100 },
  { month: "Dec", votes: 2700 },
]

export default function ResultsPage() {
  const totalVotes = pollResults.reduce((sum, poll) => sum + poll.totalVotes, 0)
  const activePollsCount = pollResults.filter((poll) => poll.status === "active").length
  const completedPollsCount = pollResults.filter((poll) => poll.status === "ended").length
  const averageParticipation = Math.round(totalVotes / pollResults.length)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground text-balance">Voting Results</h1>
            <p className="text-muted-foreground">Real-time insights into democratic participation</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalVotes.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Votes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Activity className="h-5 w-5" />
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedPollsCount}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{averageParticipation}</p>
                  <p className="text-sm text-muted-foreground">Avg. Participation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="polls" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="polls">Poll Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="polls" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pollResults.map((poll) => (
              <Card key={poll.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 text-balance">{poll.title}</CardTitle>
                      <CardDescription className="text-pretty">{poll.description}</CardDescription>
                    </div>
                    <Badge variant={poll.status === "active" ? "default" : "secondary"} className="ml-4">
                      {poll.status === "active" ? "Live" : "Final"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {poll.status === "active" ? "Ends" : "Ended"} {new Date(poll.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{poll.totalVotes.toLocaleString()} votes</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Results List */}
                    <div className="space-y-3">
                      {poll.options.map((option, index) => (
                        <div key={option.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: option.color }} />
                              <span className="text-sm font-medium">{option.text}</span>
                              {index === 0 && poll.status === "ended" && (
                                <Badge variant="secondary" className="text-xs">
                                  Winner
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {option.votes} ({option.percentage}%)
                            </span>
                          </div>
                          <Progress value={option.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>

                    {/* Chart */}
                    <div className="mt-6">
                      <ResultsChart data={poll.options} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Participation Trends</CardTitle>
                <CardDescription>Monthly voting activity over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <ParticipationChart data={participationData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Key performance indicators for democratic participation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Voter Turnout Rate</span>
                    <span className="text-sm text-muted-foreground">73.2%</span>
                  </div>
                  <Progress value={73.2} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Poll Completion Rate</span>
                    <span className="text-sm text-muted-foreground">89.5%</span>
                  </div>
                  <Progress value={89.5} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Community Engagement</span>
                    <span className="text-sm text-muted-foreground">91.8%</span>
                  </div>
                  <Progress value={91.8} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Platform Satisfaction</span>
                    <span className="text-sm text-muted-foreground">94.3%</span>
                  </div>
                  <Progress value={94.3} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
