import InfoCard from '@/components/shared/info-card';
import { Wallet } from 'lucide-react';

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
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card p-2 border shadow-md">
              <div
                style={{
                  backgroundImage: `url(${wallet.icon})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: '32px',
                  height: '32px',
                }}
                role="img"
                aria-label={`${wallet.name} logo`}
              />
            </div>
            <span className="text-sm font-medium text-foreground">{wallet.name}</span>
          </div>
        ))}
      </div>
    </InfoCard>
  );
};
export default SupportedWallets;
