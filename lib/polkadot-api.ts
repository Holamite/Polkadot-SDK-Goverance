import { ApiPromise, WsProvider } from "@polkadot/api"
import { web3Accounts, web3Enable, web3FromAddress } from "@polkadot/extension-dapp"
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types"
import { config } from "./config"

// Use Paseo testnet endpoint from config
const WS_PROVIDER = config.polkadotEndpoints.paseo

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

  async switchToPaseoNetwork(): Promise<void> {
    try {
      // Check if we can access the extension's network switching
      const extensions = await web3Enable("Voting Platform")
      if (extensions.length === 0) {
        throw new Error("No Polkadot extension found")
      }

      console.log("Attempting to switch to Paseo network...")
      
      // Check if Talisman extension is available
      const talismanExtension = extensions.find(ext => ext.name === "talisman")
      if (!talismanExtension) {
        throw new Error("Talisman extension not found")
      }

      // Try different methods to switch network
      if (talismanExtension.switchNetwork) {
        await talismanExtension.switchNetwork("paseo")
        console.log("Switched to Paseo network via switchNetwork")
      } else if (talismanExtension.switchChain) {
        await talismanExtension.switchChain("paseo")
        console.log("Switched to Paseo network via switchChain")
      } else if (talismanExtension.request) {
        // Try using the request method
        await talismanExtension.request({
          method: "talisman_switchNetwork",
          params: ["paseo"]
        })
        console.log("Switched to Paseo network via request method")
      } else {
        // Check if we can access the global Talisman object
        if (typeof window !== 'undefined' && (window as any).talisman) {
          const talisman = (window as any).talisman
          if (talisman.switchNetwork) {
            await talisman.switchNetwork("paseo")
            console.log("Switched to Paseo network via global Talisman object")
          } else {
            throw new Error("Network switching not supported by this extension")
          }
        } else {
          throw new Error("Network switching not supported by this extension")
        }
      }
    } catch (error) {
      console.error("Failed to switch to Paseo network:", error)
      throw new Error("Please manually switch to Paseo network in your Talisman wallet extension")
    }
  }

  async forceReconnectToPaseo(): Promise<void> {
    try {
      console.log("Force reconnecting to Paseo network...")
      
      // Disconnect current connection
      if (this.api) {
        await this.api.disconnect()
        this.api = null
      }
      
      // Force reinitialize with Paseo endpoint
      const wsProvider = new WsProvider(config.polkadotEndpoints.paseo)
      this.api = await ApiPromise.create({ provider: wsProvider })
      console.log("Force reconnected to Paseo network with endpoint:", config.polkadotEndpoints.paseo)
      
      // Verify the connection by checking the chain name
      try {
        const chain = await this.api.rpc.system.chain()
        console.log("Connected to chain:", chain.toString())
      } catch (error) {
        console.log("Could not get chain name:", error)
      }
      
      // Reconnect wallet to get new accounts
      await this.connectWallet()
      
      console.log("Force reconnected to Paseo network")
    } catch (error) {
      console.error("Failed to force reconnect to Paseo:", error)
      throw error
    }
  }

  async getCurrentNetwork(): Promise<string> {
    try {
      if (!this.api) {
        return "unknown"
      }
      
      const chain = await this.api.rpc.system.chain()
      return chain.toString()
    } catch (error) {
      console.error("Failed to get current network:", error)
      return "unknown"
    }
  }

  async checkPaseoNetwork(): Promise<boolean> {
    try {
      const network = await this.getCurrentNetwork()
      return network.toLowerCase().includes("paseo")
    } catch (error) {
      console.error("Failed to check Paseo network:", error)
      return false
    }
  }

  getApiEndpoint(): string {
    return config.polkadotEndpoints.paseo
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
