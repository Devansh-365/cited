"use client";

import type { Gap } from "@/types";

interface GapTableProps {
  gaps: Gap[];
}

const platformLabels: Record<string, string> = {
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  google_ai: "Google AI",
};

const priorityColor: Record<string, string> = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-gray-400",
};

export default function GapTable({ gaps }: GapTableProps) {
  if (gaps.length === 0) {
    return (
      <div>
        <h3 className="font-serif text-lg font-medium text-gray-900">
          Where You&apos;re Missing
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          No significant gaps found — your brand has some presence across AI
          platforms.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-serif text-lg font-medium text-gray-900">
        Where You&apos;re Missing
      </h3>
      <p className="mt-1 text-sm text-gray-400">
        {gaps.length} gaps — queries where competitors appear but you don&apos;t
      </p>

      <div className="mt-6 space-y-0 divide-y divide-gray-100">
        {gaps.slice(0, 12).map((gap, i) => (
          <div key={i} className="flex items-start gap-4 py-3">
            <span
              className={`mt-0.5 text-xs font-medium uppercase ${priorityColor[gap.priority]}`}
            >
              {gap.priority}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-900">
                &quot;{gap.prompt}&quot;
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {platformLabels[gap.platform] || gap.platform}
                {gap.competitorsPresent.length > 0 && (
                  <> &middot; {gap.competitorsPresent.join(", ")}</>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {gaps.length > 12 && (
        <p className="mt-4 text-center text-sm text-gray-400">
          + {gaps.length - 12} more gaps
        </p>
      )}
    </div>
  );
}
