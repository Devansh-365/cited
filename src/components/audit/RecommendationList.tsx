"use client";

import { useState } from "react";
import type { Recommendation } from "@/types";

interface RecommendationListProps {
  recommendations: Recommendation[];
  brandName: string;
}

const difficultyLabel: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export default function RecommendationList({
  recommendations,
  brandName,
}: RecommendationListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (recommendations.length === 0) return null;

  return (
    <div>
      <h3 className="font-serif text-lg font-medium text-gray-900">
        Your Action Plan
      </h3>
      <p className="mt-1 text-sm text-gray-400">
        {recommendations.length} recommendations to improve {brandName}&apos;s
        AI visibility
      </p>

      <div className="mt-6 space-y-0 divide-y divide-gray-100">
        {recommendations.map((rec, i) => {
          const isExpanded = expandedIndex === i;

          return (
            <div key={i} className="py-4">
              <button
                type="button"
                className="flex w-full items-start gap-3 text-left"
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
              >
                <span className="mt-0.5 shrink-0 text-sm text-gray-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {rec.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {difficultyLabel[rec.difficulty] || rec.difficulty}
                    {" "}&middot;{" "}
                    {rec.impact} impact
                  </p>
                </div>
                <span className="shrink-0 text-sm text-gray-300">
                  {isExpanded ? "−" : "+"}
                </span>
              </button>

              {isExpanded && (
                <div className="ml-9 mt-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Why this matters
                    </p>
                    <p className="mt-0.5 text-sm text-gray-400">{rec.why}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      How to do it
                    </p>
                    <p className="mt-0.5 text-sm text-gray-400">
                      {rec.actionDetail}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
