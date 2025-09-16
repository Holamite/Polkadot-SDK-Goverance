"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Vote, Plus, Eye, Clock } from "lucide-react"
import { useRecentActivity } from "@/hooks/use-user-activity"
import { formatDistanceToNow } from "date-fns"

export default function ActivityPage() {
  const { activities, loading } = useRecentActivity(50)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "vote":
        return <Vote className="h-4 w-4 text-green-600" />
      case "proposal_created":
        return <Plus className="h-4 w-4 text-blue-600" />
      case "proposal_viewed":
        return <Eye className="h-4 w-4 text-gray-600" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "vote":
        return "bg-green-100 text-green-800 border-green-200"
      case "proposal_created":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "proposal_viewed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getActivityLabel = (type: string) => {
    switch (type) {
      case "vote":
        return "Voted"
      case "proposal_created":
        return "Created Proposal"
      case "proposal_viewed":
        return "Viewed Proposal"
      default:
        return "Activity"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading activity...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Platform Activity</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Recent governance activity across the platform
            </p>
          </div>

          {activities.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                <p className="text-muted-foreground">Activity will appear here as users interact with proposals</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${getActivityColor(activity.type)} text-xs`}>
                            {getActivityLabel(activity.type)}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                          </div>
                        </div>
                        <h4 className="font-medium text-sm mb-1 truncate">{activity.proposalTitle}</h4>
                        {activity.details && <p className="text-xs text-muted-foreground">{activity.details}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
