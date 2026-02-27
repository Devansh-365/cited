"use client";

import { useState } from "react";
import type { Recommendation } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface RecommendationListProps {
  recommendations: Recommendation[];
  brandName: string;
}

const difficultyConfig: Record<string, { variant: "default" | "secondary" | "destructive"; emoji: string }> = {
  easy: { variant: "default", emoji: "🟢" },
  medium: { variant: "secondary", emoji: "🟡" },
  hard: { variant: "destructive", emoji: "🔴" },
};

export default function RecommendationList({
  recommendations,
  brandName,
}: RecommendationListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (recommendations.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Action Plan</CardTitle>
        <CardDescription>
          {recommendations.length} recommendations to improve {brandName}&apos;s
          AI visibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, i) => {
          const isExpanded = expandedIndex === i;
          const diff = difficultyConfig[rec.difficulty] || difficultyConfig.medium;

          return (
            <div
              key={i}
              className={`rounded-lg border p-4 transition-colors ${
                isExpanded ? "border-primary/30 bg-primary/5" : ""
              }`}
            >
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-0 hover:bg-transparent"
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
              >
                <div className="flex items-start gap-3 w-full text-left">
                  <span className="text-lg mt-0.5 shrink-0">
                    {diff.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug">
                      {i + 1}. {rec.title}
                    </p>
                    <div className="flex gap-2 mt-1.5">
                      <Badge variant={diff.variant} className="text-xs">
                        {rec.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rec.impact} impact
                      </Badge>
                    </div>
                  </div>
                  <span className="text-muted-foreground text-lg shrink-0">
                    {isExpanded ? "−" : "+"}
                  </span>
                </div>
              </Button>

              {isExpanded && (
                <div className="mt-3 ml-9 space-y-3">
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-1">Why this matters:</p>
                    <p className="text-sm text-muted-foreground">{rec.why}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">How to do it:</p>
                    <p className="text-sm text-muted-foreground">
                      {rec.actionDetail}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
