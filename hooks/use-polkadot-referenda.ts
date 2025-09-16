"use client"

import { useState, useEffect, useCallback } from "react"
import { config, fetchReferendumDetails } from "@/lib/config"
import type { Referendum, OngoingReferendum } from "@polkadot-api/sdk-governance"

export interface ReferendumDetails {
  id: number
  title: string
  description?: string
  status: string
  track?: any
  details?: { title: string }
}

// Dynamic import to avoid SSR issues
let polkadotAPIClient: any = null

const getPolkadotAPIClient = async () => {
  if (typeof window === 'undefined') return null
  if (polkadotAPIClient) return polkadotAPIClient
  
  const { polkadotAPIClient: client } = await import("@/lib/polkadot-api-client")
  polkadotAPIClient = client
  return polkadotAPIClient
}

export function usePolkadotReferenda() {
  const [referenda, setReferenda] = useState<ReferendumDetails[]>([])
  const [ongoingReferenda, setOngoingReferenda] = useState<ReferendumDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const initializeClient = useCallback(async () => {
    if (initialized) {
      console.log("Already initialized, skipping...")
      return
    }

    console.log("Starting initialization in hook...")
    try {
      setLoading(true)
      setError(null)
      
      console.log("Getting polkadotAPIClient...")
      const client = await getPolkadotAPIClient()
      if (!client) {
        throw new Error("Polkadot API Client not available")
      }
      
      console.log("Calling client.initialize()...")
      await client.initialize()
      console.log("client.initialize() completed, setting initialized to true")
      setInitialized(true)
    } catch (err) {
      console.error("Initialization error in hook:", err)
      setError(err instanceof Error ? err.message : "Failed to initialize Polkadot API")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchReferenda = useCallback(async () => {
    if (!initialized) return

    try {
      setLoading(true)
      setError(null)
      
      const client = await getPolkadotAPIClient()
      if (!client) {
        throw new Error("Polkadot API Client not available")
      }
      
      const allReferenda = await client.getReferenda()
      const ongoing = await client.getOngoingReferenda()
      
      // Transform referenda to our format
      const transformedReferenda: ReferendumDetails[] = allReferenda.map((ref: Referendum) => ({
        id: ref.index,
        title: `Referendum #${ref.index}`,
        status: ref.type,
        track: ref.track,
      }))

      const transformedOngoing: ReferendumDetails[] = ongoing.map((ref: OngoingReferendum) => ({
        id: ref.index,
        title: `Referendum #${ref.index}`,
        status: "Ongoing",
        track: ref.track,
      }))

      setReferenda(transformedReferenda)
      setOngoingReferenda(transformedOngoing)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch referenda")
    } finally {
      setLoading(false)
    }
  }, [initialized])

  const fetchReferendumDetailsWithApi = useCallback(async (referendumId: number, apiKey?: string) => {
    if (!initialized) return null

    try {
      const referendum = await polkadotAPIClient.getReferendum(referendumId)
      if (!referendum) return null

      let details = undefined
      const apiKeyToUse = apiKey || config.referendumDetailsApiKey
      
      if (apiKeyToUse) {
        try {
          // Use our custom API function
          details = await fetchReferendumDetails(referendumId, apiKeyToUse)
        } catch (err) {
          console.warn("Failed to fetch referendum details from API:", err)
        }
      }

      const track = await client.getReferendumTrack(referendum)

      return {
        id: (referendum as any).id || (referendum as any).index || 0,
        title: details?.title || `Referendum #${(referendum as any).id || (referendum as any).index || 0}`,
        status: referendum.type,
        track,
        details,
      }
    } catch (err) {
      console.error("Failed to fetch referendum details:", err)
      return null
    }
  }, [initialized])

  const createSpenderReferendum = useCallback(async (
    beneficiaryAddress: string,
    amount: bigint,
    signer: any,
    accountAddress: string
  ) => {
    if (!initialized) {
      throw new Error("Client not initialized")
    }

    try {
      const client = await getPolkadotAPIClient()
      if (!client) {
        throw new Error("Polkadot API Client not available")
      }
      return await client.createSpenderReferenda(beneficiaryAddress, amount, signer, accountAddress)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to create spender referendum")
    }
  }, [initialized])

  const createRemarkReferendum = useCallback(async (remark: string, signer: any, accountAddress: string) => {
    if (!initialized) {
      throw new Error("Client not initialized")
    }

    try {
      const client = await getPolkadotAPIClient()
      if (!client) {
        throw new Error("Polkadot API Client not available")
      }
      return await client.createRemarkReferenda(remark, signer, accountAddress)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to create remark referendum")
    }
  }, [initialized])

  useEffect(() => {
    initializeClient()
  }, [initializeClient])

  useEffect(() => {
    if (initialized) {
      fetchReferenda()
    }
  }, [initialized, fetchReferenda])

  return {
    referenda,
    ongoingReferenda,
    loading,
    error,
    initialized,
    fetchReferenda,
    fetchReferendumDetails: fetchReferendumDetailsWithApi,
    createSpenderReferendum,
    createRemarkReferendum,
    initializeClient,
  }
}
