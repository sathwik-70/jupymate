import InfoCard from '@/components/shared/info-card';
import { Wallet } from 'lucide-react';
import Image from 'next/image';

const wallets = [
  { name: 'Phantom', icon: 'https://placehold.co/48x48.png', hint: 'ghost' },
  { name: 'Solflare', icon: 'https://placehold.co/48x48.png', hint: 'sun fire' },
  { name: 'Backpack', icon: 'https://placehold.co/48x48.png', hint: 'backpack' },
];

const SupportedWallets = () => {
  return (
    <InfoCard
      title="Supported Wallets"
      icon={Wallet}
      description="Integrated via the Unified Wallet Kit."
    >
      <div className="grid grid-cols-3 gap-x-4 gap-y-5 text-center">
        {wallets.map((wallet) => (
          <div key={wallet.name} className="flex flex-col items-center gap-2">
            <Image
              src={wallet.icon}
              alt={`${wallet.name} logo`}
              width={40}
              height={40}
              className="rounded-full bg-muted"
              data-ai-hint={wallet.hint}
            />
            <span className="text-xs font-medium text-foreground">{wallet.name}</span>
          </div>
        ))}
      </div>
    </InfoCard>
  );
};
export default SupportedWallets;
