'use client';

import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const WalletMultiButton = dynamic(
  () =>
    import('@solana/wallet-adapter-react-ui').then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const Header = () => {
  return (
    <header className="container mx-auto px-4 py-4 border-b">
      <div className="flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-headline text-foreground">Jupymate Navigator</h1>
        </Link>
        <div className="flex items-center gap-4">
            <Button asChild variant="outline">
                <a href="https://docs.jup.ag/" target="_blank" rel="noopener noreferrer">
                    View Docs
                </a>
            </Button>
            <WalletMultiButton />
        </div>
      </div>
    </header>
  );
};
export default Header;
