"use client";

import { useState } from 'react';
import { getTooltip } from '@/ai/flows/contextual-assistance';
import mcpConfigData from '@/config/mcpConfig.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bot, HelpCircle } from 'lucide-react';

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

const McpConfigViewer = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary"/>
            AI-Assisted MCP Config
        </CardTitle>
        <CardDescription>
          Hover over any key in the JSON configuration below to get an AI-generated explanation of its purpose.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap break-all overflow-x-auto">
          <JsonRenderer data={mcpConfigData} fullConfig={mcpConfigData} />
        </div>
      </CardContent>
    </Card>
  );
};

export default McpConfigViewer;
