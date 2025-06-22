import InfoCard from '@/components/shared/info-card';
import { Badge } from '@/components/ui/badge';
import { Server } from 'lucide-react';

const apiEndpoints = [
  { method: 'GET', path: '/quote', description: 'Real-time swap rates' },
  { method: 'POST', path: '/swap', description: 'Unsigned swap transactions' },
  { method: 'POST', path: '/swap-instructions', description: 'Custom tx instructions' },
  { method: 'GET', path: '/program-id-to-label', description: 'Program ID mapping' },
];

const ApiEndpoints = () => {
  return (
    <InfoCard
      title="API Endpoints"
      icon={Server}
      description="Core Jupiter APIs for swaps and data."
    >
      <div className="space-y-4 text-sm">
        {apiEndpoints.map((api) => (
          <div key={api.path} className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={api.method === 'GET' ? 'secondary' : 'default'} className="w-14 justify-center flex-shrink-0">{api.method}</Badge>
              <code className="font-mono whitespace-nowrap">.../swap/v1{api.path}</code>
            </div>
            <p className="text-muted-foreground text-right">{api.description}</p>
          </div>
        ))}
         <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-accent/50 text-accent w-14 justify-center flex-shrink-0">SHIELD</Badge>
              <code className="font-mono whitespace-nowrap">Token Safety</code>
            </div>
             <p className="text-muted-foreground text-right">Integrated validation</p>
        </div>
      </div>
    </InfoCard>
  );
};
export default ApiEndpoints;
