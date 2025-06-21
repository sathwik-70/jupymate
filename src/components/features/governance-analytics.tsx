import InfoCard from '@/components/shared/info-card';
import { BarChart2, Box, ExternalLink, Vote } from 'lucide-react';

const links = [
  { name: 'Catalytics Governance', purpose: 'Real-time governance analytics', link: 'https://catalytics.pro/jupiter/governance', icon: Vote },
  { name: 'Catalytics Litterbox', purpose: 'Proposal tracking metrics', link: 'https://catalytics.pro/jupiter/litterbox', icon: Box },
  { name: 'Flipside Dashboard', purpose: 'Voting & participation analytics', link: 'https://flipsidecrypto.xyz/jupdevrel/jupiter-governance-metrics--xKB0a', icon: BarChart2 },
];

const GovernanceAnalytics = () => {
  return (
    <InfoCard
      title="Governance Data"
      icon={Vote}
      description="Analytics from community platforms."
    >
       <div className="space-y-3">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-2 -m-2 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex-shrink-0 bg-muted p-2 rounded-md">
              <link.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="ml-3 flex-grow">
              <p className="font-semibold text-foreground">{link.name}</p>
              <p className="text-sm text-muted-foreground">{link.purpose}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground ml-2" />
          </a>
        ))}
      </div>
    </InfoCard>
  );
};
export default GovernanceAnalytics;
