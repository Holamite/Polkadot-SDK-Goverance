// Configuration for API keys and external services
export const config = {
  // Subscan API key for referendum details
  referendumDetailsApiKey: process.env.NEXT_PUBLIC_SUBSCAN_API_KEY || "",
  
  // Polkadot network endpoints
  polkadotEndpoints: {
    mainnet: "wss://rpc.polkadot.io",
    westend: "wss://westend-rpc.polkadot.io", // Westend testnet
    paseo: "wss://paseo-rpc.dwellir.com", // Paseo testnet (backup)
  },
  
  // Default network to use
  defaultNetwork: "paseo" as const,
}

// Helper function to get referendum details with Subscan API key
export async function fetchReferendumDetails(referendumId: number, apiKey?: string): Promise<{ title: string; description?: string } | null> {
  if (!apiKey) {
    console.warn("No Subscan API key provided for referendum details")
    return null
  }

  try {
    // Subscan API call for referendum details (Paseo network)
    const response = await fetch(`https://paseo.api.subscan.io/api/scan/referenda`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        referenda_index: referendumId,
        row: 1,
        page: 0,
      }),
    })

    if (!response.ok) {
      throw new Error(`Subscan API request failed: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.code === 0 && data.data && data.data.list && data.data.list.length > 0) {
      const referendum = data.data.list[0]
      return {
        title: referendum.title || `Referendum #${referendumId}`,
        description: referendum.content || referendum.description,
      }
    }
    
    return {
      title: `Referendum #${referendumId}`,
      description: "No additional details available",
    }
  } catch (error) {
    console.error("Failed to fetch referendum details from Subscan:", error)
    return null
  }
}
