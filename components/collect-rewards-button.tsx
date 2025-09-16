"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Gift, Loader2, CheckCircle, ExternalLink } from "lucide-react"
import { usePolkadotWallet } from "@/hooks/use-polkadot-wallet"

export function CollectRewardsButton() {
  const { isConnected, selectedAccount, balance, collectRewards } = usePolkadotWallet()
  const [isCollecting, setIsCollecting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCollectRewards = async () => {
    if (!isConnected || !selectedAccount) {
      return
    }

    setIsCollecting(true)
    setError(null)
    setTransactionHash(null)

    try {
      const hash = await collectRewards()
      setTransactionHash(hash)
      console.log("Rewards collected successfully:", hash)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to collect rewards"
      setError(errorMessage)
      console.error("Failed to collect rewards:", err)
    } finally {
      setIsCollecting(false)
    }
  }

  if (!isConnected) {
    return (
      <Button variant="outline" disabled className="flex items-center gap-2 bg-transparent">
        <Gift className="h-4 w-4" />
        Connect Wallet to Collect
      </Button>
    )
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
          <Gift className="h-4 w-4" />
          Collect Rewards
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Collect Governance Rewards
          </DialogTitle>
          <DialogDescription>
            Collect your rewards for participating in governance voting and proposals.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Account Info */}
          <div className="rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Account</span>
              <Badge variant="outline">{balance}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{selectedAccount?.meta.name || "Unnamed Account"}</p>
            <p className="text-xs text-muted-foreground font-mono">{selectedAccount?.address}</p>
          </div>

          {/* Reward Info */}
          <div className="rounded-lg border p-4 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Available Rewards</span>
            </div>
            <p className="text-lg font-bold text-primary">0.1 DOT</p>
            <p className="text-xs text-muted-foreground">Estimated reward for governance participation</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Success Display */}
          {transactionHash && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Rewards Collected Successfully!</span>
              </div>
              <p className="text-xs text-green-700 mb-2">Transaction Hash: {transactionHash.slice(0, 20)}...</p>
              <a
                href={`https://polkadot.subscan.io/extrinsic/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 hover:underline inline-flex items-center gap-1"
              >
                View on Subscan <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDialog(false)} disabled={isCollecting}>
            {transactionHash ? "Close" : "Cancel"}
          </Button>
          {!transactionHash && (
            <Button onClick={handleCollectRewards} disabled={isCollecting} className="bg-primary hover:bg-primary/90">
              {isCollecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Collecting...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Collect 0.1 DOT
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
