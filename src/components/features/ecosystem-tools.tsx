import InfoCard from '@/components/shared/info-card';
import { Book, Code, ExternalLink, Package } from 'lucide-react';

const tools = [
  { name: 'Official Docs', purpose: 'Developer API documentation', link: 'https://dev.jup.ag/docs/api', icon: Book },
  { name: 'DevRel GitHub', purpose: 'Sample apps & code examples', link: 'https://github.com/Jupiter-DevRel', icon: Code },
  { name: 'JupiverseKit', purpose: 'React libraries for swap widgets', link: 'https://www.jupiversekit.xyz', icon: Package },
];

const EcosystemTools = () => {
  return (
    <InfoCard
      title="Ecosystem Tools"
      icon={Package}
      description="Resources for building with Jupiter."
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
