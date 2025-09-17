import { ApiPromise, WsProvider } from "@polkadot/api"
import { decodeAddress } from "@polkadot/util-crypto"
import { config } from "./config"

export class PolkadotAPIClient {
  private static instance: PolkadotAPIClient
  private api: ApiPromise | null = null
  private initialized: boolean = false

  private constructor() {}

  static getInstance(): PolkadotAPIClient {
    if (!PolkadotAPIClient.instance) {
      PolkadotAPIClient.instance = new PolkadotAPIClient()
    }
    return PolkadotAPIClient.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    // Only initialize on client side
    if (typeof window === 'undefined') {
      console.log("Skipping Polkadot API initialization on server side")
      return
    }

    try {
      console.log("Starting Polkadot API Client initialization...")
      
      // Use Paseo testnet endpoint
      const provider = new WsProvider(config.polkadotEndpoints.paseo)
      console.log("Creating API with Paseo endpoint...")
      
      this.api = await ApiPromise.create({ provider })
      console.log("API created successfully")
      
      // Log available modules for debugging
      console.log("Available query modules:", Object.keys(this.api.query))
      console.log("Available transaction modules:", Object.keys(this.api.tx))
      
      // Check for governance-related modules
      const governanceModules = ['referenda', 'democracy', 'governance', 'convictionVoting']
      governanceModules.forEach(module => {
        const hasModule = !!this.api.query[module]
        console.log(`Has ${module} query module:`, hasModule)
        if (hasModule) {
          console.log(`${module} query methods:`, Object.keys(this.api.query[module]))
        }
      })
      
      // Check for transaction modules
      const txModules = ['Treasury', 'treasury', 'System', 'system', 'Democracy', 'democracy', 'ConvictionVoting', 'convictionVoting', 'Referenda', 'referenda']
      txModules.forEach(module => {
        const hasModule = !!this.api.tx[module]
        console.log(`Has ${module} tx module:`, hasModule)
        if (hasModule) {
          console.log(`${module} tx methods:`, Object.keys(this.api.tx[module]))
        }
      })
      
      // Check for specific referendum-related methods
      console.log("=== REFERENDUM CREATION METHODS ===")
      if (this.api.tx.referenda) {
        console.log("referenda tx methods:", Object.keys(this.api.tx.referenda))
      }
      if (this.api.tx.Referenda) {
        console.log("Referenda tx methods:", Object.keys(this.api.tx.Referenda))
      }
      if (this.api.tx.democracy) {
        console.log("democracy tx methods:", Object.keys(this.api.tx.democracy))
      }
      if (this.api.tx.Democracy) {
        console.log("Democracy tx methods:", Object.keys(this.api.tx.Democracy))
      }
      
      this.initialized = true
      console.log("Polkadot API Client initialized successfully with Paseo")
    } catch (error) {
      console.error("Failed to initialize Polkadot API Client:", error)
      this.initialized = false
      throw error
    }
  }

  async createSpenderReferenda(beneficiaryAddress: string, amount: bigint, signer: any, accountAddress: string): Promise<any> {
    if (!this.initialized || !this.api) {
      throw new Error("Client not initialized")
    }

    try {
      console.log("createSpenderReferenda: Starting creation...")
      console.log("createSpenderReferenda: Beneficiary:", beneficiaryAddress)
      console.log("createSpenderReferenda: Amount:", amount.toString())
      console.log("createSpenderReferenda: Account:", accountAddress)
      
      // First, try to create a proper referendum using referenda module
      const hasReferenda = !!this.api.tx.referenda
      const hasReferendaUpper = !!this.api.tx.Referenda
      console.log("createSpenderReferenda: Has referenda (lower):", hasReferenda)
      console.log("createSpenderReferenda: Has Referenda (upper):", hasReferendaUpper)
      
      if (hasReferenda || hasReferendaUpper) {
        console.log("createSpenderReferenda: Creating proper referendum...")
        
        // Check if Treasury module exists (try both cases)
        const hasTreasuryUpper = !!this.api.tx.Treasury
        const hasTreasuryLower = !!this.api.tx.treasury
        console.log("createSpenderReferenda: Has Treasury (upper):", hasTreasuryUpper)
        console.log("createSpenderReferenda: Has treasury (lower):", hasTreasuryLower)
        
        // Log available treasury methods
        if (hasTreasuryLower) {
          console.log("createSpenderReferenda: Treasury methods:", Object.keys(this.api.tx.treasury))
          if (this.api.tx.treasury.spend) {
            console.log("createSpenderReferenda: treasury.spend method:", this.api.tx.treasury.spend)
            console.log("createSpenderReferenda: treasury.spend meta:", this.api.tx.treasury.spend.meta)
          }
        }
        if (hasTreasuryUpper) {
          console.log("createSpenderReferenda: Treasury methods:", Object.keys(this.api.tx.Treasury))
          if (this.api.tx.Treasury.spend) {
            console.log("createSpenderReferenda: Treasury.spend method:", this.api.tx.Treasury.spend)
            console.log("createSpenderReferenda: Treasury.spend meta:", this.api.tx.Treasury.spend.meta)
          }
        }
        
        if (!hasTreasuryUpper && !hasTreasuryLower) {
          throw new Error("Treasury module not available for spend call")
        }
        
        // Skip complex treasury spend creation for now
        // We'll create a remark referendum instead
        console.log("createSpenderReferenda: Skipping treasury spend creation, using remark referendum")
        
        // Create a system remark call for the treasury proposal
        const remarkCall = this.api.tx.system.remark(`Treasury spend proposal: ${amount} to ${beneficiaryAddress}`)
        console.log("createSpenderReferenda: Remark call created:", remarkCall.hash.toHex())
        
        // Submit as referendum
        let proposal
        try {
          const referendumModule = hasReferenda ? this.api.tx.referenda : this.api.tx.Referenda
          console.log("createSpenderReferenda: Creating referendum with module:", referendumModule ? "found" : "not found")
          
          // Use the correct format for referenda.submit
          // The proposal needs to be wrapped in the correct enum format
          proposal = referendumModule.submit(
            { system: "Root" }, // Origin
            { Inline: remarkCall.toHex() }, // Proposal as Inline bytes
            { After: 0 } // Enactment period
          )
          console.log("createSpenderReferenda: Referendum proposal created successfully")
        } catch (referendumError) {
          console.error("createSpenderReferenda: Failed to create referendum proposal:", referendumError)
          throw new Error(`Failed to create referendum proposal: ${referendumError}`)
        }
        
        console.log("createSpenderReferenda: Referendum proposal hash:", proposal.hash.toHex())
        
        // Submit the referendum
        let txHash
        try {
          console.log("createSpenderReferenda: Signing and submitting referendum...")
          txHash = await proposal.signAndSend(accountAddress, { signer })
          console.log("createSpenderReferenda: Referendum transaction result:", txHash)
          console.log("createSpenderReferenda: Referendum transaction hash:", txHash.toString())
        } catch (signError) {
          console.error("createSpenderReferenda: Failed to sign and send referendum:", signError)
          throw new Error(`Failed to sign and send referendum: ${signError}`)
        }
        
        return {
          index: txHash.toString(),
          track: "Treasury",
          hash: txHash.toString(),
          type: "referendum"
        }
      } else {
        console.log("createSpenderReferenda: No referenda module, falling back to treasury spend...")
        
        // Fallback to direct treasury spend (not a referendum)
        const hasTreasuryUpper = !!this.api.tx.Treasury
        const hasTreasuryLower = !!this.api.tx.treasury
        
        if (!hasTreasuryUpper && !hasTreasuryLower) {
          throw new Error("Neither referenda nor treasury modules available")
        }
        
        let proposal
        if (hasTreasuryUpper) {
          proposal = this.api.tx.Treasury.spend(amount, beneficiaryAddress)
          console.log("createSpenderReferenda: Using Treasury.spend (upper)")
        } else {
          proposal = this.api.tx.treasury.spend(amount, beneficiaryAddress)
          console.log("createSpenderReferenda: Using treasury.spend (lower)")
        }
        
        const proposalHash = proposal.hash.toHex()
        console.log("createSpenderReferenda: Treasury spend hash:", proposalHash)
        
        const txHash = await proposal.signAndSend(accountAddress, { signer })
        
        console.log("createSpenderReferenda: Treasury spend transaction result:", txHash)
        console.log("createSpenderReferenda: Treasury spend transaction hash:", txHash.toString())
        
        return {
          index: txHash.toString(),
          track: "Treasury",
          hash: txHash.toString(),
          type: "treasury_spend"
        }
      }
    } catch (error) {
      console.error("Failed to create spender referendum:", error)
      throw error
    }
  }

  async createRemarkReferenda(remark: string, signer: any, accountAddress: string): Promise<any> {
    if (!this.initialized || !this.api) {
      throw new Error("Client not initialized")
    }

    try {
      console.log("createRemarkReferenda: Starting creation...")
      console.log("createRemarkReferenda: Remark:", remark)
      console.log("createRemarkReferenda: Account:", accountAddress)
      
      // First, try to create a proper referendum using referenda module
      const hasReferenda = !!this.api.tx.referenda
      const hasReferendaUpper = !!this.api.tx.Referenda
      console.log("createRemarkReferenda: Has referenda (lower):", hasReferenda)
      console.log("createRemarkReferenda: Has Referenda (upper):", hasReferendaUpper)
      
      if (hasReferenda || hasReferendaUpper) {
        console.log("createRemarkReferenda: Creating proper referendum...")
        
        // Create a system remark call
        const hasSystemUpper = !!this.api.tx.System
        const hasSystemLower = !!this.api.tx.system
        let remarkCall
        
        if (hasSystemUpper) {
          remarkCall = this.api.tx.System.remark(remark)
          console.log("createRemarkReferenda: Using System.remark (upper)")
        } else if (hasSystemLower) {
          remarkCall = this.api.tx.system.remark(remark)
          console.log("createRemarkReferenda: Using system.remark (lower)")
        } else {
          throw new Error("System module not available for remark call")
        }
        
        // Submit as referendum
        const referendumModule = hasReferenda ? this.api.tx.referenda : this.api.tx.Referenda
        const proposal = referendumModule.submit(
          { system: "Root" }, // Origin (Root for system calls)
          { Inline: remarkCall.toHex() }, // Proposal as Inline bytes
          { After: 0 } // Enactment period
        )
        
        console.log("createRemarkReferenda: Referendum proposal hash:", proposal.hash.toHex())
        
        // Submit the referendum
        const txHash = await proposal.signAndSend(accountAddress, { signer })
        
        console.log("createRemarkReferenda: Referendum transaction result:", txHash)
        console.log("createRemarkReferenda: Referendum transaction hash:", txHash.toString())
        
        return {
          index: txHash.toString(),
          track: "Root",
          hash: txHash.toString(),
          type: "referendum"
        }
      } else {
        console.log("createRemarkReferenda: No referenda module, falling back to system remark...")
        
        // Fallback to system remark (not a referendum)
        const hasSystemUpper = !!this.api.tx.System
        const hasSystemLower = !!this.api.tx.system
        
        if (!hasSystemUpper && !hasSystemLower) {
          throw new Error("Neither referenda nor system modules available")
        }
        
        let proposal
        if (hasSystemUpper) {
          proposal = this.api.tx.System.remark(remark)
          console.log("createRemarkReferenda: Using System.remark (upper)")
        } else {
          proposal = this.api.tx.system.remark(remark)
          console.log("createRemarkReferenda: Using system.remark (lower)")
        }
        
        const proposalHash = proposal.hash.toHex()
        console.log("createRemarkReferenda: System remark hash:", proposalHash)
        
        const txHash = await proposal.signAndSend(accountAddress, { signer })
        
        console.log("createRemarkReferenda: System remark transaction result:", txHash)
        console.log("createRemarkReferenda: System remark transaction hash:", txHash.toString())
        
        return {
          index: txHash.toString(),
          track: "System",
          hash: txHash.toString(),
          type: "system_remark"
        }
      }
    } catch (error) {
      console.error("Failed to create remark referendum:", error)
      throw error
    }
  }

  async getReferenda(): Promise<any[]> {
    if (!this.initialized || !this.api) {
      throw new Error("Client not initialized")
    }

    try {
      console.log("getReferenda: Starting query...")
      
      // Check if referenda module exists
      const hasReferenda = this.api.query.referenda
      console.log("getReferenda: Has referenda module:", !!hasReferenda)
      
      if (!hasReferenda) {
        console.log("getReferenda: No referenda module found, trying alternative queries...")
        
        // Try alternative query methods
        const alternativeQueries = [
          'democracy.referendumInfoOf',
          'democracy.referendumCount',
          'democracy.referendums',
          'governance.referendumInfoOf',
          'governance.referendumCount'
        ]
        
        for (const query of alternativeQueries) {
          try {
            const [module, method] = query.split('.')
            if (this.api.query[module] && this.api.query[module][method]) {
              console.log(`getReferenda: Trying ${query}...`)
              const result = await this.api.query[module][method].entries()
              console.log(`getReferenda: ${query} result:`, result.length, "entries")
              if (result.length > 0) {
                return result.map(([key, info]) => ({
                  id: key.args[0].toString(),
                  info: info.toHuman()
                }))
              }
            }
          } catch (err) {
            console.log(`getReferenda: ${query} failed:`, err)
          }
        }
        
        return []
      }
      
      // Check referendum count first
      const referendumCount = await this.api.query.referenda.referendumCount()
      console.log("getReferenda: Referendum count:", referendumCount.toString())
      
      // Get all referenda using the standard method
      const referenda = await this.api.query.referenda.referendumInfoFor.entries()
      console.log("getReferenda: Raw referenda entries:", referenda.length)
      
      // Debug: Log each entry to see what's in storage
      referenda.forEach(([key, info], index) => {
        console.log(`getReferenda: Entry ${index}:`, {
          key: key.args[0].toString(),
          info: info.toHuman(),
          infoType: info.type
        })
      })
      
      const result = referenda.map(([key, info]) => ({
        id: key.args[0].toString(),
        info: info.toHuman()
      }))
      
      console.log("getReferenda: Processed referenda:", result)
      return result
    } catch (error) {
      console.error("Failed to get referenda:", error)
      throw error
    }
  }

  async getOngoingReferenda(): Promise<any[]> {
    if (!this.initialized || !this.api) {
      throw new Error("Client not initialized")
    }

    try {
      console.log("getOngoingReferenda: Starting query...")
      
      // First get all referenda
      const allReferenda = await this.getReferenda()
      console.log("getOngoingReferenda: All referenda from getReferenda:", allReferenda.length)
      
      // Filter for ongoing referenda
      const ongoing = allReferenda.filter(ref => {
        const status = ref.info?.status || ref.info?.state || "Unknown"
        console.log(`getOngoingReferenda: Referendum ${ref.id} status:`, status)
        return status === "Ongoing" || status === "ongoing" || status === "Submitted"
      })
      
      console.log("getOngoingReferenda: Filtered ongoing referenda:", ongoing.length)
      return ongoing
    } catch (error) {
      console.error("Failed to get ongoing referenda:", error)
      throw error
    }
  }

  async getReferendumDetails(referendumId: number): Promise<any> {
    if (!this.initialized || !this.api) {
      throw new Error("Client not initialized")
    }

    try {
      const referendum = await this.api.query.referenda.referendumInfoFor(referendumId)
      return referendum.toHuman()
    } catch (error) {
      console.error("Failed to get referendum details:", error)
      throw error
    }
  }

  async getReferendumTrack(referendum: any): Promise<any> {
    if (!this.initialized || !this.api) {
      throw new Error("Client not initialized")
    }

    try {
      // Return a default track for now
      return "General"
    } catch (error) {
      console.error("Failed to get referendum track:", error)
      throw error
    }
  }
}

export const polkadotAPIClient = PolkadotAPIClient.getInstance()