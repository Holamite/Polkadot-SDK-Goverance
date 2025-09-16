"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Loader2 } from "lucide-react"

import { Fragment } from "react"
import { Menu, Transition } from "@headlessui/react"
import {
  ChevronDownIcon,
  ClipboardDocumentIcon,
  WalletIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { usePolkadotWallet } from "@/hooks/use-polkadot-wallet"
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types"

export function WalletConnection() {
  const {
    accounts,
    selectedAccount,
    balance,
    isConnecting,
    isConnected,
    error,
    connectWallet,
    selectAccount,
    disconnect,
  } = usePolkadotWallet()

  const [showAccountSelector, setShowAccountSelector] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  if (!isConnected) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Connect Polkadot Wallet
            </DialogTitle>
            <DialogDescription>
              Connect your Polkadot.js extension to participate in governance voting and collect rewards.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Polkadot.js Extension</CardTitle>
                <CardDescription className="text-sm">
                  The official Polkadot wallet extension for browsers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={connectWallet} disabled={isConnecting} className="w-full">
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Polkadot.js
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Don't have Polkadot.js extension?</p>
              <a
                href="https://polkadot.js.org/extension/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Download here <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    // <DropdownMenu>
    //   <DropdownMenuTrigger asChild>
    //     <Button variant="outline" className="flex items-center gap-2 min-w-[140px] bg-transparent">
    //       <Avatar className="h-6 w-6">
    //         <AvatarFallback className="text-xs bg-primary text-primary-foreground">
    //           {selectedAccount?.meta.name?.slice(0, 2).toUpperCase() || "DOT"}
    //         </AvatarFallback>
    //       </Avatar>
    //       <div className="flex flex-col items-start">
    //         <span className="text-sm font-medium">{selectedAccount?.meta.name || "Account"}</span>
    //         <span className="text-xs text-muted-foreground">{formatAddress(selectedAccount?.address || "")}</span>
    //       </div>
    //       <ChevronDown className="h-4 w-4" />
    //     </Button>
    //   </DropdownMenuTrigger>

    //   <DropdownMenuContent align="end" className="w-64">
    //     <DropdownMenuLabel className="flex items-center justify-between">
    //       <span>Wallet Connected</span>
    //       <Badge variant="secondary" className="text-xs">
    //         {balance}
    //       </Badge>
    //     </DropdownMenuLabel>

    //     <DropdownMenuSeparator />

    //     <DropdownMenuItem
    //       onClick={() => copyAddress(selectedAccount?.address || "")}
    //       className="flex items-center gap-2"
    //     >
    //       <Copy className="h-4 w-4" />
    //       Copy Address
    //     </DropdownMenuItem>

    //     {accounts.length > 1 && (
    //       <DropdownMenuItem onClick={() => setShowAccountSelector(true)}>
    //         <Wallet className="h-4 w-4 mr-2" />
    //         Switch Account ({accounts.length})
    //       </DropdownMenuItem>
    //     )}

    //     <DropdownMenuSeparator />

    //     <DropdownMenuItem
    //       onClick={disconnect}
    //       className="flex items-center gap-2 text-destructive focus:text-destructive"
    //     >
    //       <LogOut className="h-4 w-4" />
    //       Disconnect
    //     </DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>
     <Menu as="div" className="relative inline-block text-left">
      {/* Trigger button */}
      <Menu.Button as={Button} variant="outline" className="flex items-center gap-2 min-w-[140px] bg-transparent">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            {selectedAccount?.meta.name?.slice(0, 2).toUpperCase() || "DOT"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">{selectedAccount?.meta.name || "Account"}</span>
          <span className="text-xs text-muted-foreground">
            {formatAddress(selectedAccount?.address || "")}
          </span>
        </div>
        <ChevronDownIcon className="h-4 w-4" />
      </Menu.Button>

      {/* Dropdown content with Radix-like animations */}
      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 scale-95 -translate-y-1"
        enterTo="opacity-100 scale-100 translate-y-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100 scale-100 translate-y-0"
        leaveTo="opacity-0 scale-95 -translate-y-1"
      >
        <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-md border bg-popover text-popover-foreground shadow-md focus:outline-none z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 text-sm font-medium">
            <span>Wallet Connected bal</span>
            <Badge variant="secondary" className="text-xs">{balance}</Badge>
          </div>
          <div className="border-t my-1" />

          {/* Copy address */}
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => copyAddress(selectedAccount?.address || "")}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm",
                  active && "bg-accent text-accent-foreground"
                )}
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
                Copy Address
              </button>
            )}
          </Menu.Item>

          {/* Switch account */}
          {accounts.length > 1 && (
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => setShowAccountSelector(true)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-sm",
                    active && "bg-accent text-accent-foreground"
                  )}
                >
                  <WalletIcon className="h-4 w-4" />
                  Switch Account ({accounts.length})
                </button>
              )}
            </Menu.Item>
          )}

          <div className="border-t my-1" />

          {/* Disconnect */}
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={disconnect}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive",
                  active && "bg-destructive/10 text-destructive"
                )}
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Disconnect
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

// Account Selector Dialog Component
export function AccountSelector({
  accounts,
  selectedAccount,
  onSelectAccount,
  open,
  onOpenChange,
}: {
  accounts: InjectedAccountWithMeta[]
  selectedAccount: InjectedAccountWithMeta | null
  onSelectAccount: (account: InjectedAccountWithMeta) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Account</DialogTitle>
          <DialogDescription>Choose which account to use for voting and transactions</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {accounts.map((account) => (
            <Card
              key={account.address}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedAccount?.address === account.address ? "ring-2 ring-primary bg-primary/5" : ""
              }`}
              onClick={() => {
                onSelectAccount(account)
                onOpenChange(false)
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {account.meta.name?.slice(0, 2).toUpperCase() || "DOT"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{account.meta.name || "Unnamed Account"}</p>
                    <p className="text-sm text-muted-foreground">{formatAddress(account.address)}</p>
                  </div>
                  {selectedAccount?.address === account.address && (
                    <Badge variant="default" className="text-xs">
                      Selected
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
