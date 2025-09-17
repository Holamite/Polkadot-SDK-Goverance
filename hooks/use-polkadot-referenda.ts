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

  console.log("usePolkadotReferenda: Hook rendered, initialized:", initialized)

  const initializeClient = useCallback(async () => {
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
    if (!initialized) {
      console.log("fetchReferenda: Not initialized, skipping")
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log("fetchReferenda: Starting fetch...")
      const client = await getPolkadotAPIClient()
      if (!client) {
        throw new Error("Polkadot API Client not available")
      }
      
      console.log("fetchReferenda: Getting all referenda...")
      const allReferenda = await client.getReferenda()
      console.log("fetchReferenda: All referenda:", allReferenda)
      
      console.log("fetchReferenda: Getting ongoing referenda...")
      const ongoing = await client.getOngoingReferenda()
      console.log("fetchReferenda: Ongoing referenda:", ongoing)
      
      // Transform referenda to our format
      const transformedReferenda: ReferendumDetails[] = allReferenda.map((ref: any) => ({
        id: parseInt(ref.id),
        title: `Referendum #${ref.id}`,
        status: ref.info?.status || "Unknown",
        track: ref.info?.track || null,
      }))

      const transformedOngoing: ReferendumDetails[] = ongoing.map((ref: any) => ({
        id: parseInt(ref.id),
        title: `Referendum #${ref.id}`,
        status: ref.info?.status || "Ongoing",
        track: ref.info?.track || null,
      }))

      console.log("fetchReferenda: Transformed referenda:", transformedReferenda)
      console.log("fetchReferenda: Transformed ongoing:", transformedOngoing)

      setReferenda(transformedReferenda)
      setOngoingReferenda(transformedOngoing)
    } catch (err) {
      console.error("fetchReferenda: Error:", err)
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

  // Auto-fetch when initialized
  useEffect(() => {
    console.log("usePolkadotReferenda: useEffect triggered, initialized:", initialized)
    if (initialized) {
      console.log("usePolkadotReferenda: Initialized is true, calling fetchReferenda...")
      fetchReferenda()
    } else {
      console.log("usePolkadotReferenda: Initialized is false, skipping fetchReferenda")
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
