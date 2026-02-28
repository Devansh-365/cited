"use client";

import type { ScoreBreakdown } from "@/types";

interface ScoreCardProps {
  score: number;
  breakdown: ScoreBreakdown;
  brandName: string;
}

export default function ScoreCard({ score, breakdown, brandName }: ScoreCardProps) {
  const getScoreInfo = (s: number) => {
    if (s < 30) return { label: "Low", message: "Your brand is nearly invisible to AI" };
    if (s <= 60) return { label: "Medium", message: "AI knows you exist, but competitors lead" };
    return { label: "High", message: "Great AI presence — keep optimizing" };
  };

  const { label, message } = getScoreInfo(score);

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
    <div>
      <h3 className="font-serif text-lg font-medium text-gray-900">
        AI Visibility Score
      </h3>
      <p className="mt-1 text-sm text-gray-400">
        How visible is {brandName} across AI platforms
      </p>

      <div className="mt-6 flex flex-col items-center gap-8 md:flex-row">
        {/* Score Ring */}
        <div className="relative shrink-0">
          <svg width="130" height="130" viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="6" />
            <circle
              cx="50" cy="50" r={radius} fill="none"
              stroke={strokeColor} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              className="score-ring"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-3xl font-medium" style={{ color: strokeColor }}>
              {score}
            </span>
            <span className="text-xs text-gray-300">/100</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="w-full flex-1">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{label}</span>
            <span className="text-sm text-gray-400">— {message}</span>
          </div>

          <div className="space-y-3">
            {breakdownItems.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="text-gray-400">
                    {item.value}% ({item.weight})
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#104eb3] transition-all duration-700"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
