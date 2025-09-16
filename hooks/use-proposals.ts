"use client"

import { useState, useEffect } from "react"
import { proposalStore, type Proposal } from "@/lib/proposal-store"

export function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const updateProposals = () => {
      setProposals(proposalStore.getProposals())
      setLoading(false)
    }

    updateProposals()
    const unsubscribe = proposalStore.subscribe(updateProposals)

    return unsubscribe
  }, [])

  return { proposals, loading }
}

export function useProposal(id: string) {
  const [proposal, setProposal] = useState<Proposal | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const updateProposal = () => {
      setProposal(proposalStore.getProposal(id))
      setLoading(false)
    }

    updateProposal()
    const unsubscribe = proposalStore.subscribe(updateProposal)

    return unsubscribe
  }, [id])

  return { proposal, loading }
}
