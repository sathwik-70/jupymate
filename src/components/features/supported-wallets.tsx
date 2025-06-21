import InfoCard from '@/components/shared/info-card';
import { Wallet } from 'lucide-react';

const wallets = [
  { name: 'Phantom', icon: 'https://placehold.co/24x24.png', hint: 'ghost' },
  { name: 'Solflare', icon: 'https://placehold.co/24x24.png', hint: 'sun fire' },
  { name: 'Glow', icon: 'https://placehold.co/24x24.png', hint: 'glowing orb' },
  { name: 'Backpack', icon: 'https://placehold.co/24x24.png', hint: 'backpack' },
  { name: 'Ledger', icon: 'https://placehold.co/24x24.png', hint: 'usb drive' },
  { name: 'MobileConnect', icon: 'https://placehold.co/24x24.png', hint: 'phone qr' },
];

const SupportedWallets = () => {
  return (
    <InfoCard
      title="Supported Wallets"
      icon={Wallet}
      description="Integrated via the Unified Wallet Kit."
    >
      <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
        {wallets.map((wallet) => (
          <li key={wallet.name} className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="font-medium text-foreground">{wallet.name}</span>
          </li>
        ))}
      </ul>
    </InfoCard>
  );
};
export default SupportedWallets;
