"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

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

interface VoteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  poll: Poll | null
  selectedOption?: number
  onConfirm: () => void
}

export function VoteConfirmationDialog({
  open,
  onOpenChange,
  poll,
  selectedOption,
  onConfirm,
}: VoteConfirmationDialogProps) {
  if (!poll || selectedOption === undefined) return null

  const selectedOptionText = poll.options.find((option) => option.id === selectedOption)?.text

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle className="h-5 w-5" />
            </div>
            <DialogTitle>Confirm Your Vote</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Please review your selection before submitting. Once submitted, your vote cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-4 bg-muted/30">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Poll:</h4>
            <p className="font-semibold text-balance">{poll.title}</p>
          </div>

          <div className="rounded-lg border p-4 bg-primary/5">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Your Selection:</h4>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-primary text-primary-foreground">
                {selectedOptionText}
              </Badge>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              This action is permanent. Make sure you've selected the correct option.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-primary hover:bg-primary/90">
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirm Vote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
