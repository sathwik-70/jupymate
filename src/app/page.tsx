
import Footer from '@/components/layout/footer';
import ApiEndpoints from '@/components/features/api-endpoints';
import SupportedWallets from '@/components/features/supported-wallets';
import EcosystemTools from '@/components/features/ecosystem-tools';
import GovernanceAnalytics from '@/components/features/governance-analytics';
import CrossTokenSwap from '@/components/features/cross-token-swap';
import McpConfigViewer from '@/components/features/mcp-config-viewer';
import PortfolioAnalyzer from '@/components/features/portfolio-analyzer';
import Header from '@/components/layout/header';
import PriceBreakdownChart from '@/components/features/price-breakdown-chart';


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-primary/5 via-accent/5 to-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Jupymate Navigator
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            A developer's compass for the Jupiverse. Explore APIs, visualize swaps, and get AI-powered insights for building on Jupiter.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <CrossTokenSwap />
            <McpConfigViewer />
          </div>

          <PortfolioAnalyzer />

          <PriceBreakdownChart />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            <ApiEndpoints />
            <SupportedWallets />
            <EcosystemTools />
            <GovernanceAnalytics />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
