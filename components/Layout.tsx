
import React from 'react';
import Header from './Header';
import { Mail, Github, Linkedin, AlertCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  onNavigate, 
}) => {
  return (
    <div className="min-h-screen flex flex-col font-sans text-jup-text selection:bg-jup-primary selection:text-white relative overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] bg-jup-primary/10 rounded-full blur-[100px] animate-blob" />
        <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-jup-accent/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-[10%] left-[20%] w-[450px] h-[450px] bg-purple-500/5 rounded-full blur-[110px] animate-blob" style={{ animationDelay: '7s' }} />
      </div>
      
      <Header 
        activeView={activeView} 
        onNavigate={onNavigate}
      />

      <main className="relative z-10 flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {children}
      </main>

      <footer className="relative z-10 border-t border-jup-muted/10 bg-jup-card/30 backdrop-blur-md py-12 mt-auto transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
             {/* Brand & Dev Info */}
             <div className="flex flex-col items-center md:items-start gap-2">
                <div className="flex items-center gap-2">
                   <span className="text-jup-primary font-black text-xl tracking-tighter uppercase">Jupymate</span>
                   <span className="text-[10px] px-2 py-0.5 rounded-full bg-jup-primary/10 text-jup-primary font-bold">V1.0</span>
                </div>
                <p className="text-jup-muted text-sm max-w-xs text-center md:text-left leading-relaxed">
                  Unified developer suite for the Jupiter ecosystem. 
                  Built with passion by <span className="text-jup-primary font-bold">Sathwik Pamu</span>.
                </p>
             </div>

             {/* Links Group */}
             <div className="flex flex-col items-center md:items-end gap-4">
                <div className="flex gap-5 text-jup-muted">
                  <a href="mailto:sathwikpamu@gmail.com" className="hover:text-jup-primary transition-all transform hover:scale-110" title="Email Me">
                    <Mail className="w-5 h-5" />
                  </a>
                  <a href="https://github.com/sathwik-70" target="_blank" rel="noopener noreferrer" className="hover:text-jup-primary transition-all transform hover:scale-110" title="GitHub Profile">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/sathwik-pamu" target="_blank" rel="noopener noreferrer" className="hover:text-jup-primary transition-all transform hover:scale-110" title="LinkedIn Profile">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
                
                <div className="flex gap-6 text-[11px] font-bold text-jup-muted/60 uppercase tracking-widest">
                  <a href="#" className="hover:text-jup-primary transition-colors">API Docs</a>
                  <a href="#" className="hover:text-jup-primary transition-colors">Safety</a>
                  <a href="#" className="hover:text-jup-primary transition-colors">Changelog</a>
                </div>
             </div>
          </div>
          
          {/* DeFi Risk Disclaimer */}
          <div className="mt-10 p-6 rounded-3xl bg-jup-surface/50 border border-jup-muted/5 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
             <div className="p-3 bg-red-500/10 rounded-2xl">
               <AlertCircle className="w-6 h-6 text-red-500/70" />
             </div>
             <div>
               <h4 className="text-xs font-bold text-jup-text uppercase tracking-widest mb-1">Risk Disclaimer</h4>
               <p className="text-[10px] text-jup-muted leading-relaxed max-w-4xl">
                 DeFi involves significant risk. Jupymate Navigator is an interface and does not provide financial advice. Users are responsible for their own transactions. Jupiter Aggregator is used for swap execution; always verify routes and slippage before signing. AI analysis is predictive and may contain inaccuracies.
               </p>
             </div>
          </div>

          <div className="mt-12 pt-8 border-t border-jup-muted/5 text-center">
             <p className="text-jup-muted/40 text-[10px] uppercase tracking-[0.3em] font-black">
               © 2025 Jupymate Navigator • Open Source for Jupiverse Hackathon
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
