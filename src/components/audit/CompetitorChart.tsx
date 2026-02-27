"use client";

import type { CompetitorResult } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";

interface CompetitorChartProps {
  brandName: string;
  brandScore: number;
  competitors: CompetitorResult[];
}

const chartConfig = {
  score: {
    label: "AI Visibility Score",
  },
} satisfies ChartConfig;

export default function CompetitorChart({
  brandName,
  brandScore,
  competitors,
}: CompetitorChartProps) {
  const chartData = [
    { name: brandName, score: brandScore, isUser: true },
    ...competitors.map((c) => ({ name: c.name, score: c.score, isUser: false })),
  ].sort((a, b) => b.score - a.score);

  if (competitors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>How You Compare</CardTitle>
          <CardDescription>
            No competitors detected. Try adding competitors manually.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>How You Compare</CardTitle>
        <CardDescription>
          Your brand vs. competitors in AI visibility
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tickLine={false}
              axisLine={false}
              tick={({ x, y, payload }) => {
                const item = chartData.find((d) => d.name === payload.value);
                return (
                  <text
                    x={x}
                    y={y}
                    dy={4}
                    textAnchor="end"
                    className="text-xs fill-foreground"
                    fontWeight={item?.isUser ? 700 : 400}
                  >
                    {item?.isUser ? `→ ${payload.value}` : payload.value}
                  </text>
                );
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={28}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isUser ? "hsl(160, 100%, 42%)" : "hsl(var(--primary))"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
