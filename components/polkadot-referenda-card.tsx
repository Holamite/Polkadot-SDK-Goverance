"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Vote, Calendar, CheckCircle, XCircle, Link as LinkIcon } from "lucide-react"
import type { ReferendumDetails } from "@/hooks/use-polkadot-referenda"

interface PolkadotReferendaCardProps {
  referendum: ReferendumDetails
  onViewDetails?: (referendum: ReferendumDetails) => void
}

export function PolkadotReferendaCard({ referendum, onViewDetails }: PolkadotReferendaCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ongoing":
        return "bg-green-100 text-green-800 border-green-200"
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "executed":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "ongoing":
        return <Clock className="h-3 w-3" />
      case "approved":
        return <CheckCircle className="h-3 w-3" />
      case "rejected":
        return <XCircle className="h-3 w-3" />
      case "executed":
        return <CheckCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-2">
            <Badge className={`${getStatusColor(referendum.status)} flex items-center gap-1`}>
              {getStatusIcon(referendum.status)}
              {referendum.status.charAt(0).toUpperCase() + referendum.status.slice(1)}
            </Badge>
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <LinkIcon className="h-3 w-3" />
              Referendum #{referendum.id}
            </Badge>
          </div>
          <Badge variant="outline" className="text-xs">
            Polkadot Chain
          </Badge>
        </div>
        <CardTitle className="text-lg leading-tight">{referendum.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {referendum.description || "On-chain referendum from Polkadot governance"}
        </CardDescription>
        {referendum.track && (
          <div className="text-xs text-muted-foreground mt-2">
            <span className="font-medium">Track:</span> {referendum.track}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Chain Status: {referendum.status}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            On-chain
          </div>
        </div>

        {referendum.details && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Additional Details</h4>
            <p className="text-xs text-muted-foreground">
              {referendum.details.title}
            </p>
          </div>
        )}

        <Button 
          className="w-full" 
          variant={referendum.status.toLowerCase() === "ongoing" ? "default" : "outline"}
          onClick={() => onViewDetails?.(referendum)}
        >
          {referendum.status.toLowerCase() === "ongoing" ? "View Details" : "View Results"}
        </Button>
      </CardContent>
    </Card>
  )
}
