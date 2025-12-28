
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithDevAssistant } from '../services/geminiService';
import { Send, Terminal, User, Bot, Loader2, Code2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { JUPITER_MCP_CONFIG } from '../constants';

const DevAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hello dev! I'm Jupymate. Ask me anything about the Jupiter API, Solana SDKs, or how to optimize your swap routes.", timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMcp, setShowMcp] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: inputValue, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const responseText = await chatWithDevAssistant(messages, inputValue);
    
    const botMsg: ChatMessage = { role: 'model', content: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMcp = () => {
    navigator.clipboard.writeText(JSON.stringify(JUPITER_MCP_CONFIG, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)] max-h-[800px]">
      
      {/* Main Chat Area */}
      <div className={`flex flex-col flex-1 bg-jup-card rounded-2xl overflow-hidden border border-jup-card shadow-2xl transition-all duration-300 ${showMcp ? 'w-2/3' : 'w-full'}`}>
        {/* Chat Header */}
        <div className="p-4 bg-jup-dark/80 backdrop-blur border-b border-jup-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-jup-secondary/20 rounded-lg">
              <Terminal className="w-5 h-5 text-jup-secondary" />
            </div>
            <div>
              <h3 className="font-bold text-white">Dev Assistant</h3>
              <p className="text-xs text-jup-muted">Powered by Gemini 3 Pro</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setShowMcp(!showMcp)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-2 ${showMcp ? 'bg-jup-primary text-jup-dark border-jup-primary' : 'border-jup-muted text-jup-muted hover:text-white'}`}
             >
                <Code2 className="w-3 h-3" />
                {showMcp ? 'Hide MCP' : 'View MCP Config'}
             </button>
             <div className="flex gap-2 items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs text-green-500 font-mono hidden sm:inline">ONLINE</span>
             </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-6 bg-jup-dark/50 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'model' ? 'bg-jup-primary text-jup-dark' : 'bg-jup-accent text-white'}`}>
                {msg.role === 'model' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'model' ? 'bg-jup-card border border-jup-card/50 text-gray-200' : 'bg-jup-accent text-white'}`}>
                {msg.role === 'model' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown 
                      components={{
                        code: ({node, className, children, ...props}) => {
                           const match = /language-(\w+)/.exec(className || '')
                           const isInline = !match && !String(children).includes('\n');
                           return isInline ? (
                             <code className="bg-black/30 px-1 py-0.5 rounded text-jup-primary font-mono text-xs" {...props}>{children}</code>
                           ) : (
                             <pre className="bg-black/50 p-3 rounded-lg overflow-x-auto border border-jup-muted/20 my-2">
                               <code className={className} {...props}>{children}</code>
                             </pre>
                           )
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-jup-primary text-jup-dark flex items-center justify-center">
                  <Bot className="w-5 h-5" />
               </div>
               <div className="bg-jup-card border border-jup-card/50 rounded-2xl p-4 flex items-center gap-2">
                 <Loader2 className="w-4 h-4 animate-spin text-jup-muted" />
                 <span className="text-xs text-jup-muted animate-pulse">Thinking...</span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-jup-dark border-t border-jup-card">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How do I get a quote from Jupiter API?"
              className="w-full bg-jup-card border border-jup-card focus:border-jup-primary/50 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none resize-none h-[50px] overflow-hidden"
            />
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-jup-primary text-jup-dark rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MCP Sidebar (Collapsible) */}
      {showMcp && (
        <div className="w-1/3 bg-jup-card rounded-2xl overflow-hidden border border-jup-card shadow-xl flex flex-col animate-fade-in">
           <div className="p-4 bg-jup-dark/80 backdrop-blur border-b border-jup-card flex justify-between items-center">
              <div>
                 <h3 className="font-bold text-white text-sm">Jupiter MCP Config</h3>
                 <p className="text-[10px] text-jup-muted">Machine Context Protocol</p>
              </div>
              <button onClick={handleCopyMcp} className="text-jup-primary hover:text-white transition-colors">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
           </div>
           <div className="flex-grow p-4 bg-black/40 overflow-y-auto custom-scrollbar">
              <pre className="text-xs font-mono text-jup-text whitespace-pre-wrap">
                {JSON.stringify(JUPITER_MCP_CONFIG, null, 2)}
              </pre>
           </div>
           <div className="p-3 bg-jup-dark/50 border-t border-jup-card text-[10px] text-jup-muted text-center">
              Copy this JSON to import Jupiter API context into Claude.
           </div>
        </div>
      )}

    </div>
  );
};

export default DevAssistant;
