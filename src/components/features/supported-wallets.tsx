import InfoCard from '@/components/shared/info-card';
import { Wallet } from 'lucide-react';
import Image from 'next/image';

const wallets = [
  { name: 'Phantom', icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/ui/src/images/phantom.svg' },
  { name: 'Solflare', icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/ui/src/images/solflare.svg' },
  { name: 'Backpack', icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/ui/src/images/backpack.svg' },
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
              width={48}
              height={48}
              className="rounded-full bg-background p-2 border"
            />
            <span className="text-xs font-medium text-foreground">{wallet.name}</span>
          </div>
        ))}
      </div>
    </InfoCard>
  );
};
export default SupportedWallets;
