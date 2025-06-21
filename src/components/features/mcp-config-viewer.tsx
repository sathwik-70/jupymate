"use client";

import { useState, useRef, useEffect } from 'react';
import { askDevAssistant, getTooltip } from '@/ai/flows/contextual-assistance';
import mcpConfigData from '@/config/mcpConfig.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, HelpCircle, Loader2, Send } from 'lucide-react';
import type { AskDevAssistantInput } from '@/ai/flows/contextual-assistance';

const AiTooltip = ({ configKey, fullConfig }: { configKey: string, fullConfig: object }) => {
  const [tooltip, setTooltip] = useState('Hover for AI-powered explanation.');
  const [wasFetched, setWasFetched] = useState(false);

  const handleOpenChange = async (open: boolean) => {
    if (open && !wasFetched) {
      setWasFetched(true);
      setTooltip('AI is thinking...');
      try {
        const result = await getTooltip({
          configParameter: configKey,
          mcpConfig: JSON.stringify(fullConfig),
        });
        setTooltip(result.tooltip);
      } catch (e) {
        console.error("Error fetching tooltip:", e);
        setTooltip('Error fetching tooltip.');
      }
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip onOpenChange={handleOpenChange}>
        <TooltipTrigger asChild>
          <span className="text-accent cursor-help border-b border-dashed border-accent/50">
            "{configKey}"
            <HelpCircle className="inline-block w-3 h-3 ml-1 text-muted-foreground" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-background border-primary" side="top" align="start">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const JsonRenderer = ({ data, fullConfig }: { data: any, fullConfig: object }) => {
  if (typeof data !== 'object' || data === null) {
    return <span className="text-green-600 dark:text-green-400">"{String(data)}"</span>;
  }

  const isArray = Array.isArray(data);
  const entries = Object.entries(data);

  return (
    <>
      <span>{isArray ? '[' : '{'}</span>
      <div className="pl-4">
        {entries.map(([key, value], index) => (
          <div key={key}>
            {!isArray && <AiTooltip configKey={key} fullConfig={fullConfig} />}
            {!isArray && <span className="mr-1">:</span>}
            <JsonRenderer data={value} fullConfig={fullConfig} />
            {index < entries.length - 1 ? ',' : ''}
          </div>
        ))}
      </div>
      <span>{isArray ? ']' : '}'}</span>
    </>
  );
};

const McpConfigViewerInternal = () => {
  return (
    <>
      <CardDescription className="mb-4">
          Hover over any key in the JSON configuration below to get an AI-generated explanation of its purpose.
      </CardDescription>
      <div className="bg-muted/50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap break-all overflow-x-auto max-h-[420px] overflow-y-auto">
        <JsonRenderer data={mcpConfigData} fullConfig={mcpConfigData} />
      </div>
    </>
  );
};

const AiDevAssistant = () => {
  type Message = { role: 'user' | 'model'; content: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const chatHistory: AskDevAssistantInput['history'] = messages.map(m => ({role: m.role, content: m.content}));
      const result = await askDevAssistant({ query: input, history: chatHistory });
      setMessages(prev => [...prev, { role: 'model', content: result.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I had trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[488px]">
      <CardDescription className="mb-4">
        Ask the AI assistant about the Jupiter API, endpoints, or how to use them.
      </CardDescription>
      <ScrollArea className="flex-grow  bg-muted/50 rounded-lg p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg px-4 py-2 max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                {msg.content}
              </div>
            </div>
          ))}
           {loading && (
            <div className="flex justify-start">
               <div className="rounded-lg px-4 py-2 bg-background flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin"/>
                  <span>Thinking...</span>
               </div>
            </div>
           )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., How do I get a quote?"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          <Send className="w-4 h-4"/>
        </Button>
      </form>
    </div>
  )
}

const McpConfigViewer = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary"/>
            AI Developer Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="config">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">MCP Config</TabsTrigger>
            <TabsTrigger value="assistant">Dev Assistant</TabsTrigger>
          </TabsList>
          <TabsContent value="config" className="mt-4">
            <McpConfigViewerInternal />
          </TabsContent>
          <TabsContent value="assistant" className="mt-4">
            <AiDevAssistant />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default McpConfigViewer;
