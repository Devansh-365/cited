"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AuditProgressProps {
  brandName: string;
}

const STEPS = [
  "Querying ChatGPT",
  "Querying Perplexity",
  "Querying Google AI",
  "Detecting brand mentions",
  "Calculating your score",
  "Generating recommendations",
];

export default function AuditProgress({ brandName }: AuditProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
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

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-white px-6">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-2xl font-medium text-gray-900">
            Auditing {brandName}
          </h2>
          <p className="text-sm text-gray-400">
            This usually takes 30–60 seconds.
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full bg-[#104eb3]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              {i < currentStep ? (
                <svg
                  className="h-4 w-4 shrink-0 text-[#104eb3]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : i === currentStep ? (
                <div className="h-4 w-4 shrink-0">
                  <div className="h-2 w-2 translate-x-1 translate-y-1 animate-pulse rounded-full bg-[#104eb3]" />
                </div>
              ) : (
                <div className="h-4 w-4 shrink-0">
                  <div className="h-2 w-2 translate-x-1 translate-y-1 rounded-full bg-gray-200" />
                </div>
              )}
              <span
                className={`text-sm ${
                  i <= currentStep ? "text-gray-900" : "text-gray-300"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
