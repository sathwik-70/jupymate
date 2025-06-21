
"use client";

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '@/hooks/use-toast';
import { analyzePortfolio } from '@/ai/flows/portfolio-analyzer';
import type { AnalyzePortfolioInput, AnalyzePortfolioOutput } from '@/ai/flows/portfolio-analyzer';
import { mintMap } from '@/config/tokens';
import InfoCard from '@/components/shared/info-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, Loader2, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const SafetyIcon = ({ status }: { status: 'Verified' | 'Community' | 'Unknown' }) => {
  switch (status) {
    case 'Verified':
      return <ShieldCheck className="w-4 h-4 text-green-500" />;
    case 'Community':
      return <ShieldAlert className="w-4 h-4 text-yellow-500" />;
    case 'Unknown':
      return <Shield className="w-4 h-4 text-gray-500" />;
    default:
      return null;
  }
};

const PortfolioAnalyzer = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzePortfolioOutput | null>(null);

  const handleAnalyze = async () => {
    if (!publicKey) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet to analyze your portfolio.",
      });
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });

      const knownTokenAccounts = tokenAccounts.value
        .map(account => {
          const info = account.account.data.parsed.info;
          const tokenInfo = mintMap.get(info.mint);
          if (tokenInfo && info.tokenAmount.uiAmount > 0) {
            return {
              symbol: tokenInfo.id,
              balance: info.tokenAmount.uiAmount,
              type: tokenInfo.type,
              mint: info.mint,
            };
          }
          return null;
        })
        .filter((t): t is NonNullable<typeof t> => t !== null);

      if (knownTokenAccounts.length === 0) {
        toast({
          title: "No Known Tokens Found",
          description: "We couldn't find any of our supported tokens in your wallet.",
        });
        setLoading(false);
        return;
      }
      
      const result = await analyzePortfolio({ tokens: knownTokenAccounts });
      setAnalysisResult(result);

    } catch (e: any) {
      console.error("Portfolio analysis error:", e);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: e.message || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getBadgeVariant = (classification: string | undefined) => {
    switch (classification) {
      case 'Degen': return 'destructive';
      case 'Investor': return 'secondary';
      case 'Normie':
      default:
        return 'default';
    }
  };


  return (
    <InfoCard
      title="AI Portfolio Analyzer"
      icon={HeartPulse}
      description="Connect your wallet for an AI-powered vibe check and token safety analysis."
    >
      <div className="space-y-4">
        {!analysisResult && (
          <div className="text-center text-muted-foreground p-4 bg-muted/50 rounded-lg">
            {loading 
              ? <div className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /><span>AI is analyzing...</span></div>
              : <p>Ready for your portfolio's vibe check?</p>
            }
          </div>
        )}

        {analysisResult && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg animate-fade-in">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">The AI has spoken. You are a...</p>
              <Badge variant={getBadgeVariant(analysisResult.classification)} className="text-lg px-4 py-1">
                {analysisResult.classification}
              </Badge>
            </div>
            <blockquote className="border-l-2 border-primary pl-4 italic text-center text-foreground">
              "{analysisResult.reasoning}"
            </blockquote>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Analyzed Tokens & Safety:</h4>
              <ul className="text-sm space-y-2">
                {analysisResult.tokenSafety.map(token => (
                  <li key={token.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SafetyIcon status={token.status} />
                      <span className="font-semibold text-foreground">{token.symbol}</span>
                    </div>
                    <span className="text-muted-foreground">{token.status}</span>
                  </li>
                ))}
              </ul>
              <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-dashed">
                Safety is based on Jupiter's strict and community token lists. 'Verified' is the highest trust level.
              </div>
            </div>
          </div>
        )}

        <Button onClick={handleAnalyze} disabled={loading || !publicKey} className="w-full">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HeartPulse className="mr-2 h-4 w-4" />}
          Analyze My Wallet
        </Button>
      </div>
    </InfoCard>
  );
};

export default PortfolioAnalyzer;
