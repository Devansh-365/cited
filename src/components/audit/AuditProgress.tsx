"use client";

import { useEffect, useState } from "react";

interface AuditProgressProps {
  brandName: string;
}

const STEPS = [
  { label: "Querying ChatGPT", platform: "chatgpt" },
  { label: "Querying Perplexity", platform: "perplexity" },
  { label: "Querying Google AI", platform: "google_ai" },
  { label: "Detecting brand mentions", platform: "detection" },
  { label: "Calculating your score", platform: "scoring" },
  { label: "Generating recommendations", platform: "recommendations" },
];

export default function AuditProgress({ brandName }: AuditProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Simulate progress steps
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card-bg border border-card-border rounded-2xl p-8 max-w-lg mx-auto text-center">
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h2 className="font-serif text-xl font-bold text-foreground mb-2">
          Auditing {brandName}
        </h2>
        <p className="text-sm text-muted">
          Checking AI visibility across ChatGPT, Perplexity, and Google AI...
        </p>
      </div>

      <div className="space-y-3 text-left">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            {i < currentStep ? (
              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : i === currentStep ? (
              <div className="w-5 h-5 rounded-full border-2 border-accent flex-shrink-0 progress-pulse" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
            )}
            <span className={`text-sm ${i <= currentStep ? "text-foreground" : "text-muted"}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted mt-6">
        This usually takes 30-60 seconds
      </p>
    </div>
  );
}
