export interface Proposal {
  id: string
  title: string
  description: string
  proposalType: string
  category: string
  votingPeriod: number
  quorumThreshold: number
  executionDelay: number
  options: string[]
  rationale: string
  implementation: string
  createdAt: Date
  endDate: Date
  status: "active" | "ended" | "executed"
  votes: Record<string, { option: string; timestamp: Date; voter: string }>
  totalVotes: number
  // Polkadot integration fields
  referendumId?: number
  trackId?: number
  onChainStatus?: string
  beneficiaryAddress?: string
  amount?: number
  callData?: string
}

export interface Vote {
  proposalId: string
  option: string
  voter: string
  timestamp: Date
}

class ProposalStore {
  private proposals: Proposal[] = []
  private votes: Vote[] = []
  private listeners: (() => void)[] = []

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    const stored = localStorage.getItem("governance-proposals")
    if (stored) {
      const data = JSON.parse(stored)
      this.proposals =
        data.proposals?.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          endDate: new Date(p.endDate),
        })) || []
      this.votes =
        data.votes?.map((v: any) => ({
          ...v,
          timestamp: new Date(v.timestamp),
        })) || []
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "governance-proposals",
        JSON.stringify({
          proposals: this.proposals,
          votes: this.votes,
        }),
      )
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener())
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  createProposal(
    proposalData: Omit<Proposal, "id" | "createdAt" | "endDate" | "status" | "votes" | "totalVotes">,
  ): string {
    const id = `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const createdAt = new Date()
    const endDate = new Date(createdAt.getTime() + proposalData.votingPeriod * 24 * 60 * 60 * 1000)

    const proposal: Proposal = {
      ...proposalData,
      id,
      createdAt,
      endDate,
      status: "active",
      votes: {},
      totalVotes: 0,
    }

    this.proposals.push(proposal)
    this.saveToStorage()
    this.notify()
    return id
  }

  getProposals(): Proposal[] {
    return [...this.proposals].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getProposal(id: string): Proposal | undefined {
    return this.proposals.find((p) => p.id === id)
  }

  vote(proposalId: string, option: string, voter: string): boolean {
    const proposal = this.proposals.find((p) => p.id === proposalId)
    if (!proposal || proposal.status !== "active" || new Date() > proposal.endDate) {
      return false
    }

    // Check if user already voted
    if (proposal.votes[voter]) {
      return false
    }

    const vote: Vote = {
      proposalId,
      option,
      voter,
      timestamp: new Date(),
    }

    proposal.votes[voter] = { option, timestamp: vote.timestamp, voter }
    proposal.totalVotes++
    this.votes.push(vote)

    this.saveToStorage()
    this.notify()
    return true
  }

  getVoteResults(proposalId: string): Record<string, number> {
    const proposal = this.getProposal(proposalId)
    if (!proposal) return {}

    const results: Record<string, number> = {}
    proposal.options.forEach((option) => {
      results[option] = 0
    })

    Object.values(proposal.votes).forEach((vote) => {
      results[vote.option] = (results[vote.option] || 0) + 1
    })

    return results
  }

  hasUserVoted(proposalId: string, voter: string): boolean {
    const proposal = this.getProposal(proposalId)
    return proposal ? !!proposal.votes[voter] : false
  }

  getUserVote(proposalId: string, voter: string): string | null {
    const proposal = this.getProposal(proposalId)
    return proposal?.votes[voter]?.option || null
  }

  // Polkadot integration methods
  updateProposalWithReferendum(proposalId: string, referendumData: {
    referendumId: number
    trackId?: number
    onChainStatus?: string
    beneficiaryAddress?: string
    amount?: number
    callData?: string
  }): boolean {
    const proposal = this.getProposal(proposalId)
    if (!proposal) return false

    proposal.referendumId = referendumData.referendumId
    proposal.trackId = referendumData.trackId
    proposal.onChainStatus = referendumData.onChainStatus
    proposal.beneficiaryAddress = referendumData.beneficiaryAddress
    proposal.amount = referendumData.amount
    proposal.callData = referendumData.callData

    this.saveToStorage()
    this.notify()
    return true
  }

  getProposalsByReferendumId(referendumId: number): Proposal | undefined {
    return this.proposals.find(p => p.referendumId === referendumId)
  }

  syncWithOnChainStatus(proposalId: string, onChainStatus: string): boolean {
    const proposal = this.getProposal(proposalId)
    if (!proposal) return false

    proposal.onChainStatus = onChainStatus
    
    // Update local status based on on-chain status
    if (onChainStatus === "Ongoing") {
      proposal.status = "active"
    } else if (onChainStatus === "Approved" || onChainStatus === "Executed") {
      proposal.status = "executed"
    } else if (onChainStatus === "Rejected" || onChainStatus === "Cancelled") {
      proposal.status = "ended"
    }

    this.saveToStorage()
    this.notify()
    return true
  }
}

export const proposalStore = new ProposalStore()
