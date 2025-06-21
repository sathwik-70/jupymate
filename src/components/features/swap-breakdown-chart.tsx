
"use client"

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';

interface SwapBreakdownChartProps {
    quoteResponse: any;
}

const SwapBreakdownChart = ({ quoteResponse }: SwapBreakdownChartProps) => {
    if (!quoteResponse || !quoteResponse.marketInfos) return null;

    const priceImpactPct = Number(quoteResponse.priceImpactPct) * 100;
    
    const totalLpFeePct = quoteResponse.marketInfos.reduce((acc: number, marketInfo: any) => {
        return acc + (marketInfo.lpFee?.pct ?? 0);
    }, 0) * 100;

    const chartData = [
        { name: 'Price Impact', value: priceImpactPct },
        { name: 'Liquidity Fees', value: totalLpFeePct },
    ];

    if (chartData.every(item => item.value === 0)) {
        return null;
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
        <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Cost Analysis</h3>
            <div className="rounded-lg border bg-card text-card-foreground p-4">
                <ChartContainer config={chartConfig} className="min-h-[100px] w-full">
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
            </div>
            <p className="text-xs text-muted-foreground mt-2">
                This chart shows estimated percentage-based costs. It does not include fixed platform fees.
            </p>
        </div>
    );
};

export default SwapBreakdownChart;
