
import React from 'react';
import { BookOpen, Terminal, Wallet, Github, BarChart3, FileText, ExternalLink, Box, Layers, Shield, Code2, User, Mail, Linkedin, Globe } from 'lucide-react';

const DocsHub: React.FC = () => {
  const resourceGroups = [
    {
      title: 'Core Documentation & API',
      icon: BookOpen,
      description: 'Essential guides and references for integrating Jupiter.',
      items: [
        { title: 'Jupiter Dev Docs', url: 'https://dev.jup.ag', icon: BookOpen, desc: 'The home of Jupiter developer documentation.' },
        { title: 'V6 Swap API Reference', url: 'https://dev.jup.ag/docs/api', icon: Code2, desc: 'Complete reference for /quote, /swap, and price endpoints.' },
        { title: 'Integrator Guidelines', url: 'https://dev.jup.ag/docs/misc/integrator-guidelines', icon: FileText, desc: 'Branding assets, logos, and best practices for partners.' },
        { title: 'DevRel GitHub', url: 'https://github.com/Jupiter-DevRel', icon: Github, desc: 'Code examples, SDKs, and starter repositories.' },
      ]
    },
    {
      title: 'Tools & SDKs',
      icon: Layers,
      description: 'Accelerate development with pre-built kits.',
      items: [
        { title: 'Jupiter Terminal', url: 'https://terminal.jup.ag', icon: Terminal, desc: 'The plug-and-play swap widget for your dApp.' },
        { title: 'Unified Wallet Kit', url: 'https://unified.jup.ag', icon: Wallet, desc: 'The best wallet adapter experience on Solana.' },
        { title: 'Jupiverse Kit', url: 'https://www.jupiversekit.xyz', icon: Box, desc: 'Beautiful React components for building Jupiverse UIs.' },
      ]
    },
    {
      title: 'Governance & Analytics',
      icon: Shield,
      description: 'Track the DAO and ecosystem health.',
      items: [
        { title: 'Flipside Metrics', url: 'https://flipsidecrypto.xyz/jupdevrel/jupiter-governance-metrics--xKB0a', icon: BarChart3, desc: 'Deep dive into J.U.P voting patterns and statistics.' },
        { title: 'Catalytics Governance', url: 'https://catalytics.pro/jupiter/governance', icon: BarChart3, desc: 'Visual dashboard for DAO proposals and activity.' },
        { title: 'Catalytics Litterbox', url: 'https://catalytics.pro/jupiter/litterbox', icon: BarChart3, desc: 'Monitoring spam and token hygiene in the ecosystem.' },
      ]
    }
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-8 overflow-y-auto custom-scrollbar pb-12">
      {/* Hero Section */}
      <div className="bg-jup-card rounded-3xl p-10 border border-jup-muted/10 shadow-xl relative overflow-hidden shrink-0 animate-fade-in">
        <div className="absolute top-0 right-0 w-80 h-80 bg-jup-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-jup-text mb-4 tracking-tight">Developer Resources</h1>
          <p className="text-jup-muted max-w-2xl text-lg leading-relaxed font-medium">
            Navigating the Jupiverse? Here is your command center for official documentation, SDKs, branding assets, and governance analytics.
          </p>
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 gap-12">
        {resourceGroups.map((group, idx) => (
          <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms` }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-jup-primary/10 rounded-2xl shadow-sm">
                <group.icon className="w-6 h-6 text-jup-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-jup-text tracking-tight">{group.title}</h2>
                <p className="text-sm text-jup-muted font-medium">{group.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {group.items.map((item, itemIdx) => (
                <a 
                  key={itemIdx} 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group glass-panel hover:bg-white dark:hover:bg-jup-surface border border-jup-muted/10 hover:border-jup-primary/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 flex flex-col h-full bg-jup-card/40"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-jup-surface/50 rounded-xl group-hover:bg-jup-primary/10 transition-colors">
                      <item.icon className="w-5 h-5 text-jup-muted group-hover:text-jup-primary transition-colors" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-jup-muted group-hover:text-jup-text transition-colors opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0 transition-all" />
                  </div>
                  <h3 className="font-bold text-jup-text mb-2 group-hover:text-jup-primary transition-colors text-base">{item.title}</h3>
                  <p className="text-xs text-jup-muted leading-relaxed font-medium line-clamp-2">{item.desc}</p>
                </a>
              ))}
            </div>
          </div>
        ))}

        {/* Developer Contact Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: `600ms` }}>
           <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-jup-accent/10 rounded-2xl shadow-sm">
                <User className="w-6 h-6 text-jup-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-jup-text tracking-tight">Meet the Developer</h2>
                <p className="text-sm text-jup-muted font-medium">Let's connect and build the future of Solana together.</p>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-8 border border-jup-accent/10 bg-jup-accent/5 relative overflow-hidden group">
               <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-jup-accent/5 rounded-full blur-3xl" />
               <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
                  <div className="flex items-center gap-6">
                     <div className="w-20 h-20 rounded-3xl bg-jup-accent flex items-center justify-center text-white shadow-xl shadow-jup-accent/20 group-hover:rotate-6 transition-transform">
                        <User className="w-10 h-10" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-jup-text tracking-tight">Sathwik Pamu</h3>
                        <p className="text-jup-accent font-bold text-sm">Full Stack Engineer & Solana Enthusiast</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-jup-muted font-mono">
                           <Globe className="w-3 h-3" /> Based in Hyderabad, India
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
                     <a href="mailto:sathwikpamu@gmail.com" className="flex items-center gap-3 bg-jup-card/60 px-5 py-4 rounded-2xl border border-jup-muted/10 hover:border-jup-accent hover:bg-white dark:hover:bg-jup-surface transition-all shadow-sm">
                        <Mail className="w-5 h-5 text-jup-accent" />
                        <div className="flex flex-col">
                           <span className="text-[10px] text-jup-muted font-bold uppercase tracking-wider">Email</span>
                           <span className="text-xs font-bold text-jup-text">sathwikpamu@gmail.com</span>
                        </div>
                     </a>
                     <a href="https://github.com/sathwik-70" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-jup-card/60 px-5 py-4 rounded-2xl border border-jup-muted/10 hover:border-jup-accent hover:bg-white dark:hover:bg-jup-surface transition-all shadow-sm">
                        <Github className="w-5 h-5 text-jup-accent" />
                        <div className="flex flex-col">
                           <span className="text-[10px] text-jup-muted font-bold uppercase tracking-wider">GitHub</span>
                           <span className="text-xs font-bold text-jup-text">sathwik-70</span>
                        </div>
                     </a>
                     <a href="https://www.linkedin.com/in/sathwik-pamu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-jup-card/60 px-5 py-4 rounded-2xl border border-jup-muted/10 hover:border-jup-accent hover:bg-white dark:hover:bg-jup-surface transition-all shadow-sm">
                        <Linkedin className="w-5 h-5 text-jup-accent" />
                        <div className="flex flex-col">
                           <span className="text-[10px] text-jup-muted font-bold uppercase tracking-wider">LinkedIn</span>
                           <span className="text-xs font-bold text-jup-text">sathwik-pamu</span>
                        </div>
                     </a>
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DocsHub;
