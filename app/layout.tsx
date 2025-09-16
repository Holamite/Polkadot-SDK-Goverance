import type React from "react"
import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "VotePlatform - Democratic Voting Made Simple",
  description: "A modern, user-friendly voting platform for democratic participation",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Suspense fallback={<div>Loading...</div>}>
          <Navigation />
        </Suspense>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
