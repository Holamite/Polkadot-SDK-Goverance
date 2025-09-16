import { ApiPromise, WsProvider } from "@polkadot/api"
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
      // Create a treasury spend proposal
      const proposal = this.api.tx.treasury.spend(amount, beneficiaryAddress)
      
      // Submit the proposal with account address and signer
      const txHash = await proposal.signAndSend(accountAddress, { signer })
      
      return {
        index: txHash.toString(),
        track: "Treasury",
        hash: txHash.toString()
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
      // Create a system remark proposal
      const proposal = this.api.tx.system.remark(remark)
      
      // Submit the proposal with account address and signer
      const txHash = await proposal.signAndSend(accountAddress, { signer })
      
      return {
        index: txHash.toString(),
        track: "General",
        hash: txHash.toString()
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
      // Get all referenda
      const referenda = await this.api.query.referenda.referendumInfoFor.entries()
      return referenda.map(([key, info]) => ({
        id: key.args[0].toString(),
        info: info.toHuman()
      }))
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
      // Get ongoing referenda
      const referenda = await this.api.query.referenda.referendumInfoFor.entries()
      return referenda
        .map(([key, info]) => ({
          id: key.args[0].toString(),
          info: info.toHuman()
        }))
        .filter(ref => ref.info && ref.info.status === "Ongoing")
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