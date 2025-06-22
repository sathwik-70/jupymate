import InfoCard from '@/components/shared/info-card';
import { Wallet } from 'lucide-react';
import { PhantomIcon } from '@/components/icons/phantom-icon';
import { SolflareIcon } from '@/components/icons/solflare-icon';
import { BackpackIcon } from '@/components/icons/backpack-icon';

const wallets = [
  { name: 'Phantom', icon: PhantomIcon },
  { name: 'Solflare', icon: SolflareIcon },
  { name: 'Backpack', icon: BackpackIcon },
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
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card p-2 border shadow-md">
              <wallet.icon width={32} height={32} />
            </div>
            <span className="text-sm font-medium text-foreground">{wallet.name}</span>
          </div>
        ))}
      </div>
    </InfoCard>
  );
};
export default SupportedWallets;
