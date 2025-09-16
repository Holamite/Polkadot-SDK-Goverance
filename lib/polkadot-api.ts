import { ApiPromise, WsProvider } from "@polkadot/api"
import { web3Accounts, web3Enable, web3FromAddress } from "@polkadot/extension-dapp"
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types"

// Westend testnet endpoint - official Polkadot testnet
const WS_PROVIDER = "wss://westend-rpc.polkadot.io"

export class PolkadotAPI {
  private static instance: PolkadotAPI
  private api: ApiPromise | null = null
  private accounts: InjectedAccountWithMeta[] = []
  private selectedAccount: InjectedAccountWithMeta | null = null

  private constructor() {}

  static getInstance(): PolkadotAPI {
    if (!PolkadotAPI.instance) {
      PolkadotAPI.instance = new PolkadotAPI()
    }
    return PolkadotAPI.instance
  }

  async initialize(): Promise<void> {
    // Only initialize on client side
    if (typeof window === 'undefined') {
      console.log("Skipping Polkadot API initialization on server side")
      return
    }

    try {
      const wsProvider = new WsProvider(WS_PROVIDER)
      this.api = await ApiPromise.create({ provider: wsProvider })
      console.log("Polkadot API initialized successfully")
    } catch (error) {
      console.error("Failed to initialize Polkadot API:", error)
      throw error
    }
  }

  async connectWallet(): Promise<InjectedAccountWithMeta[]> {
    // Only run on client side
    if (typeof window === 'undefined') {
      console.log("Wallet connection skipped on server side")
      return []
    }

    try {
      // Enable the extension
      const extensions = await web3Enable("VotePlatform")
      if (extensions.length === 0) {
        throw new Error("No Polkadot extension found. Please install Polkadot.js extension.")
      }

      // Get all accounts
      this.accounts = await web3Accounts()
      if (this.accounts.length === 0) {
        throw new Error("No accounts found. Please create an account in your Polkadot extension.")
      }

      console.log("Polkadot connected successfully, found accounts:", this.accounts.length)
      return this.accounts
    } catch (error) {
      console.error("Polkadot Failed to connect wallet:", error)
      throw error
    }
  }

  setSelectedAccount(account: InjectedAccountWithMeta): void {
    this.selectedAccount = account
    console.log("Selected account:", account.address)
  }

  getSelectedAccount(): InjectedAccountWithMeta | null {
    return this.selectedAccount
  }

  getAccounts(): InjectedAccountWithMeta[] {
    return this.accounts
  }

  async getBalance(address: string): Promise<string> {
    if (!this.api) {
      throw new Error("API not initialized")
    }

    try {
      const accountInfo = await this.api.query.system.account(address) as unknown as { data: { free: any } }
      const free = accountInfo.data.free.toString()
      const formatted = this.api.createType("Balance", free).toHuman()
      return typeof formatted === "string" ? formatted : String(formatted)
    } catch (error) {
      console.error("PolkadotFailed to get balance:", error)
      return "0 DOT"
    }
  }

  async transfer(to: string, amount: string): Promise<string> {
    if (!this.api || !this.selectedAccount) {
      throw new Error("API not initialized or no account selected")
    }

    try {
      const injector = await web3FromAddress(this.selectedAccount.address)
      const transfer = this.api.tx.balances.transferKeepAlive(to, amount)

      const hash = await transfer.signAndSend(this.selectedAccount.address, { signer: injector.signer })

      console.log("Polkadot Transfer submitted with hash:", hash.toString())
      return hash.toString()
    } catch (error) {
      console.error("Polkadot Transfer failed:", error)
      throw error
    }
  }

  async collectRewards(): Promise<string> {
    if (!this.api || !this.selectedAccount) {
      throw new Error("API not initialized or no account selected")
    }

    try {
      const injector = await web3FromAddress(this.selectedAccount.address)

      // This is a mock implementation - in a real DAO, you'd have specific reward collection logic
      // For now, I will simulate a small DOT transfer as a reward collection
      const rewardAmount = "1000000000000" // 0.1 DOT in Planck units
      const treasuryAddress = "13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB" // Example treasury address

      const collectTx = this.api.tx.balances.transferKeepAlive(this.selectedAccount.address, rewardAmount)

      const hash = await collectTx.signAndSend(this.selectedAccount.address, { signer: injector.signer })

      console.log("Polkadot Reward collection submitted with hash:", hash.toString())
      return hash.toString()
    } catch (error) {
      console.error("Polkadot Reward collection failed:", error)
      throw error
    }
  }

  isConnected(): boolean {
    return this.accounts.length > 0 && this.selectedAccount !== null
  }

  disconnect(): void {
    this.accounts = []
    this.selectedAccount = null
    console.log("Polkadot Wallet disconnected")
  }
}

export const polkadotAPI = PolkadotAPI.getInstance()
