import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';
import Link from 'next/link';

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
        <Button asChild>
          <a href="https://dev.jup.ag/docs/api" target="_blank" rel="noopener noreferrer">
            View Documentation
          </a>
        </Button>
      </div>
    </header>
  );
};
export default Header;
