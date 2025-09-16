import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Vote, Users, Shield, BarChart3, ArrowRight, TrendingUp, Plus } from "lucide-react"
import { CollectRewardsButton } from "@/components/collect-rewards-button"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background to-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl">
                <Vote className="h-10 w-10" />
              </div>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Decentralized <span className="text-primary">Governance Platform</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
              Participate in DAO governance, vote on proposals, and earn rewards for your contributions to the
              community. Connect your Polkadot wallet to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/proposals">
                  View Proposals <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base px-8 py-6 border-2 hover:bg-muted/50 bg-transparent"
              >
                <Link href="/create">
                  Create Proposal <Plus className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <CollectRewardsButton />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">Why Choose Our DAO Platform?</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Trusted by the community for secure and transparent decentralized governance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Shield className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl mb-2">Blockchain Secured</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Built on Polkadot infrastructure with cryptographic security ensuring transparent and immutable
                  governance decisions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl mb-2">Community Driven</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Every token holder has a voice in shaping the future of the protocol through democratic proposal
                  voting.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl mb-2">Earn Rewards</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Get rewarded for active participation in governance through voting, proposal creation, and community
                  engagement.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">How It Works</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Four simple steps to participate in DAO governance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Connect Wallet</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect your Polkadot.js wallet to access governance features and verify your token holdings.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Review Proposals</h3>
              <p className="text-muted-foreground leading-relaxed">
                Explore active governance proposals and read detailed information about each decision.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Cast Your Vote</h3>
              <p className="text-muted-foreground leading-relaxed">
                Vote on proposals using your token weight. Your vote is recorded on-chain for transparency.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold shadow-lg">
                4
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Collect Rewards</h3>
              <p className="text-muted-foreground leading-relaxed">
                Earn DOT rewards for your active participation in governance and community building.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">
              Ready to Participate in Governance?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 text-pretty leading-relaxed">
              Join our decentralized community and help shape the future of the protocol. Your voice and vote matter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/proposals">
                  <Vote className="mr-2 h-5 w-5" />
                  View Proposals
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base px-8 py-6 border-2 hover:bg-muted/50 bg-transparent"
              >
                <Link href="/results">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Results
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
