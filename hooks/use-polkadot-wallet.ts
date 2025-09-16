"use client"

import { useState, useEffect, useCallback } from "react"
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types"

// Dynamic import to avoid SSR issues
let polkadotAPI: any = null

const getPolkadotAPI = async () => {
  if (typeof window === 'undefined') return null
  if (polkadotAPI) return polkadotAPI
  
  const { polkadotAPI: api } = await import("@/lib/polkadot-api")
  polkadotAPI = api
  return polkadotAPI
}

interface UsePolkadotWalletReturn {
  accounts: InjectedAccountWithMeta[]
  selectedAccount: InjectedAccountWithMeta | null
  balance: string
  isConnecting: boolean
  isConnected: boolean
  error: string | null
  connectWallet: () => Promise<void>
  selectAccount: (account: InjectedAccountWithMeta) => void
  disconnect: () => void
  collectRewards: () => Promise<string>
  refreshBalance: () => Promise<void>
}

export function usePolkadotWallet(): UsePolkadotWalletReturn {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([])
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null)
  const [balance, setBalance] = useState<string>("0 DOT")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshBalance = useCallback(async () => {
    if (selectedAccount) {
      try {
        const api = await getPolkadotAPI()
        if (!api) return
        const newBalance = await api.getBalance(selectedAccount.address)
        setBalance(newBalance)
      } catch (err) {
        console.error("Polkadot Failed to refresh balance:", err)
      }
    }
  }, [selectedAccount])

  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const api = await getPolkadotAPI()
      if (!api) {
        throw new Error("Polkadot API not available")
      }

      // Initialize API if not already done
      await api.initialize()

      // Connect wallet
      const walletAccounts = await api.connectWallet()
      setAccounts(walletAccounts)

      // Auto-select first account if available
      if (walletAccounts.length > 0) {
        const firstAccount = walletAccounts[0]
        api.setSelectedAccount(firstAccount)
        setSelectedAccount(firstAccount)

        // Get balance for selected account
        const accountBalance = await api.getBalance(firstAccount.address)
        setBalance(accountBalance)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet"
      setError(errorMessage)
      console.error("Polkadot Wallet connection error:", err)
    } finally {
      setIsConnecting(false)
    }
  }

  const selectAccount = async (account: InjectedAccountWithMeta) => {
    const api = await getPolkadotAPI()
    if (api) {
      api.setSelectedAccount(account)
    }
    setSelectedAccount(account)
    refreshBalance()
  }

  const disconnect = async () => {
    const api = await getPolkadotAPI()
    if (api) {
      api.disconnect()
    }
    setAccounts([])
    setSelectedAccount(null)
    setBalance("0 DOT")
    setError(null)
  }

  const collectRewards = async (): Promise<string> => {
    if (!selectedAccount) {
      throw new Error("No account selected")
    }

    try {
      const api = await getPolkadotAPI()
      if (!api) {
        throw new Error("Polkadot API not available")
      }
      const hash = await api.collectRewards()
      // Refresh balance after collecting rewards
      setTimeout(refreshBalance, 2000) // Wait 2 seconds for transaction to be processed
      return hash
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to collect rewards"
      setError(errorMessage)
      throw err
    }
  }

  // Check if wallet is connected on mount
  useEffect(() => {
    const checkStoredAccounts = async () => {
      const api = await getPolkadotAPI()
      if (!api) return

      const storedAccounts = api.getAccounts()
      const storedSelectedAccount = api.getSelectedAccount()

      if (storedAccounts.length > 0) {
        setAccounts(storedAccounts)
      }

      if (storedSelectedAccount) {
        setSelectedAccount(storedSelectedAccount)
        refreshBalance()
      }
    }

    checkStoredAccounts()
  }, [refreshBalance])

  return {
    accounts,
    selectedAccount,
    balance,
    isConnecting,
    isConnected: accounts.length > 0 && selectedAccount !== null,
    error,
    connectWallet,
    selectAccount,
    disconnect,
    collectRewards,
    refreshBalance,
  }
}
