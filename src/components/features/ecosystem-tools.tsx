import InfoCard from '@/components/shared/info-card';
import { Book, Code, ExternalLink, Image, Package, Link as LinkIcon } from 'lucide-react';

const tools = [
  { name: 'Official Dev Docs', purpose: 'The primary documentation for Jupiter developers.', link: 'https://dev.jup.ag', icon: Book },
  { name: 'Jupiter Terminal', purpose: 'An interface for all of Jupiter\'s swap-related features.', link: 'https://terminal.jup.ag', icon: Code },
  { name: 'DevRel GitHub', purpose: 'Sample applications and code examples.', link: 'https://github.com/Jupiter-DevRel', icon: Code },
  { name: 'Jupiverse Kit', purpose: 'A React library for swap widgets.', link: 'https://www.jupiversekit.xyz', icon: Package },
  { name: 'Unified Wallet Kit', purpose: 'Connect to any wallet on Solana.', link: 'https://unified.jup.ag', icon: Package },
  { name: 'General Branding', purpose: 'Official Jupiter branding and assets.', link: 'https://dev.jup.ag/docs/misc/integrator-guidelines', icon: Image },
  { name: 'DevRel Branding', purpose: 'Community and developer-focused assets.', link: 'https://drive.google.com/drive/folders/1lV1jO7uxDGusDSzFMg5ecEb9Sox1JTTR?usp=drive_link', icon: Image },
];

const EcosystemTools = () => {
  return (
    <InfoCard
      title="Ecosystem Tools"
      icon={Package}
      description="Essential resources and libraries for building with Jupiter."
    >
      <div className="space-y-3">
        {tools.map((tool) => (
          <a
            key={tool.name}
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-2 -m-2 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex-shrink-0 bg-muted p-2 rounded-md">
              <tool.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="ml-3 flex-grow">
              <p className="font-semibold text-foreground">{tool.name}</p>
              <p className="text-sm text-muted-foreground">{tool.purpose}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground ml-2" />
          </a>
        ))}
      </div>
    </InfoCard>
  );
};
export default EcosystemTools;
