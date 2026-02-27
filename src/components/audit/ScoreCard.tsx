"use client";

import type { ScoreBreakdown } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ScoreCardProps {
  score: number;
  breakdown: ScoreBreakdown;
  brandName: string;
}

export default function ScoreCard({ score, breakdown, brandName }: ScoreCardProps) {
  const getScoreInfo = (s: number) => {
    if (s < 30) return { variant: "destructive" as const, label: "Low", message: "Your brand is nearly invisible to AI" };
    if (s <= 60) return { variant: "secondary" as const, label: "Medium", message: "AI knows you exist, but competitors lead" };
    return { variant: "default" as const, label: "High", message: "Great AI presence! Keep optimizing" };
  };

  const { variant, label, message } = getScoreInfo(score);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const strokeColor = score < 30 ? "#ef4444" : score <= 60 ? "#f59e0b" : "#22c55e";

  const breakdownItems = [
    { label: "Mention Frequency", value: breakdown.mentionFrequency, weight: "40%" },
    { label: "Sentiment Quality", value: breakdown.sentimentQuality, weight: "20%" },
    { label: "Platform Coverage", value: breakdown.platformCoverage, weight: "20%" },
    { label: "Position Strength", value: breakdown.positionStrength, weight: "20%" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Visibility Score</CardTitle>
        <CardDescription>How visible is {brandName} across AI platforms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Score Ring */}
          <div className="relative shrink-0">
            <svg width="140" height="140" viewBox="0 0 100 100" className="-rotate-90">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
              <circle
                cx="50" cy="50" r={radius} fill="none"
                stroke={strokeColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
                className="score-ring"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold" style={{ color: strokeColor }}>{score}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={variant}>{label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{message}</p>

            <div className="space-y-3">
              {breakdownItems.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground">{item.value}% ({item.weight})</span>
                  </div>
                  <Progress value={item.value} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
