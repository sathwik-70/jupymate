
"use client"

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, Pie, PieChart, Tooltip } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SwapBreakdownChartProps {
    quoteResponse: any;
}

const CostAnalysisChart = ({ quoteResponse }: SwapBreakdownChartProps) => {
    const priceImpactPct = Number(quoteResponse.priceImpactPct) * 100;
    
    const totalLpFeePct = quoteResponse.marketInfos.reduce((acc: number, marketInfo: any) => {
        return acc + (marketInfo.lpFee?.pct ?? 0);
    }, 0) * 100;

    const chartData = [
        { name: 'Price Impact', value: priceImpactPct },
        { name: 'Liquidity Fees', value: totalLpFeePct },
    ];

    if (chartData.every(item => item.value === 0)) {
        return (
            <div className="flex items-center justify-center h-[150px] text-muted-foreground">
                No percentage-based costs for this swap.
            </div>
        );
    }
    
    const colors: { [key: string]: string } = {
        'Price Impact': priceImpactPct < 1 ? 'hsl(var(--chart-2))' : priceImpactPct < 3 ? 'hsl(var(--chart-4))' : 'hsl(var(--chart-1))',
        'Liquidity Fees': 'hsl(var(--chart-5))'
    };
    
    const chartConfig: ChartConfig = {
        value: {
            label: '%',
        },
        ...chartData.reduce((acc, item) => {
            acc[item.name as keyof ChartConfig] = {
                label: item.name,
                color: colors[item.name],
            };
            return acc;
        }, {} as ChartConfig)
    };

    return (
         <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
            <BarChart
                accessibilityLayer
                data={chartData}
                layout="vertical"
                margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
            >
                <CartesianGrid horizontal={false} />
                <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    width={110}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <XAxis 
                    type="number" 
                    dataKey="value"
                    domain={[0, 'dataMax + 0.05']}
                    tickFormatter={(value) => `${Number(value).toFixed(3)}%`}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    allowDecimals={true}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent
                        formatter={(value) => `${Number(value).toFixed(4)}%`}
                        indicator="dot"
                    />}
                />
                <Bar dataKey="value" radius={4} barSize={20}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[entry.name as keyof typeof colors]} />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    )
}

const FeeDistributionChart = ({ marketInfos }: { marketInfos: any[] }) => {
    const feeData = marketInfos.map(info => ({
        name: info.label,
        value: (info.lpFee?.pct ?? 0),
    })).filter(d => d.value > 0);

    if (feeData.length === 0) {
        return (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No liquidity fees were applied in this swap.
            </div>
        );
    }

    const chartConfig = feeData.reduce((acc, item, index) => {
        acc[item.name] = {
            label: item.name,
            color: `hsl(var(--chart-${(index % 5) + 1}))`,
        };
        return acc;
    }, {} as ChartConfig);

    return (
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <PieChart>
                <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent
                        hideLabel
                        formatter={(value, name) => (
                           <div className="flex flex-col items-start gap-1">
                               <span className="font-semibold text-foreground">{name}</span>
                               <span className="text-muted-foreground">
                                   Fee: {Number(value).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 4 })}
                               </span>
                           </div>
                        )}
                    />}
                />
                <Pie data={feeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {feeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartConfig[entry.name]?.color} className="stroke-background focus:outline-none" />
                    ))}
                </Pie>
            </PieChart>
        </ChartContainer>
    );
};


const SwapAnalyticsCharts = ({ quoteResponse }: SwapBreakdownChartProps) => {
    if (!quoteResponse || !quoteResponse.marketInfos) return null;

    return (
        <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Swap Analytics</h3>
            <div className="rounded-lg border bg-card text-card-foreground p-4">
                <Tabs defaultValue="cost">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
                        <TabsTrigger value="fees">Fee Distribution</TabsTrigger>
                    </TabsList>
                    <TabsContent value="cost" className="pt-4">
                       <CostAnalysisChart quoteResponse={quoteResponse} />
                       <p className="text-xs text-muted-foreground mt-2">
                            This chart shows estimated percentage-based costs. It does not include fixed platform fees.
                        </p>
                    </TabsContent>
                    <TabsContent value="fees" className="pt-4">
                        <FeeDistributionChart marketInfos={quoteResponse.marketInfos} />
                         <p className="text-xs text-muted-foreground mt-2">
                            This pie chart shows the breakdown of liquidity provider fees by protocol.
                        </p>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default SwapAnalyticsCharts;
