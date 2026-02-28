"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

import BrandForm, { ResponseItem } from "@/components/audit/brand-form";
import AuditProgress from "@/components/audit/AuditProgress";
import ScoreCard from "@/components/audit/ScoreCard";
import CompetitorChart from "@/components/audit/CompetitorChart";
import GapTable from "@/components/audit/GapTable";
import RecommendationList from "@/components/audit/RecommendationList";
import type { AuditResponse, CategoryId } from "@/types";
import { auditRequestSchema } from "@/lib/utils/validators";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";


type ViewState = "welcome" | "form" | "loading" | "results" | "error";

const FORM_ID = "cited-audit";

const QUESTION_LIST = [
  {
    id: "brandName",
    text: "What's your brand name?",
    type: "SHORT_TEXT",
    order: 1,
    formId: FORM_ID,
  },
  {
    id: "websiteUrl",
    text: "What's your website URL? (optional)",
    type: "WEBSITE",
    order: 2,
    formId: FORM_ID,
  },
  {
    id: "category",
    text: "What category best describes your brand?",
    type: "DROPDOWN",
    order: 3,
    formId: FORM_ID,
  },
  {
    id: "competitors",
    text: "Name up to 5 competitors (comma-separated, optional)",
    type: "SHORT_TEXT",
    order: 4,
    formId: FORM_ID,
  },
];

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>("welcome");
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [brandNameForLoading, setBrandNameForLoading] = useState("");

  const handleFormSubmit = async (responses: ResponseItem[]) => {
    const get = (id: string) =>
      responses.find((r) => r.questionId === id)?.text ?? "";

    const brandName = get("brandName");
    const websiteUrl = get("websiteUrl");
    const category = get("category") as CategoryId;
    const competitorsRaw = get("competitors");
    const competitors = competitorsRaw
      ? competitorsRaw
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    const payload = {
      brandName,
      websiteUrl: websiteUrl || undefined,
      category,
      competitors: competitors.length > 0 ? competitors : undefined,
    };

    // Validate before sending
    const validated = auditRequestSchema.safeParse(payload);
    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message ?? "Invalid input";
      setError(firstError);
      setViewState("error");
      return;
    }

    setBrandNameForLoading(brandName);
    setViewState("loading");
    setError("");
    setIsRateLimited(false);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (errData.code === "RATE_LIMIT") {
          setIsRateLimited(true);
        }
        throw new Error(errData.error || `Audit failed (${response.status})`);
      }

      const result: AuditResponse = await response.json();
      setAuditData(result);
      setViewState("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setViewState("error");
    }
  };

  const handleReset = () => {
    setViewState("welcome");
    setAuditData(null);
    setError("");
  };

  // Welcome screen
  if (viewState === "welcome") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-white px-6">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex max-w-xl flex-col items-center gap-6 text-center"
          >
            <h1 className="font-serif text-4xl font-medium tracking-tight text-gray-900 md:text-5xl">
              Is AI recommending your brand?
            </h1>
            <p className="text-lg text-gray-500">
              Find out in 60 seconds. We&apos;ll check your visibility across
              ChatGPT, Perplexity, and Google AI — and show you exactly where
              you stand.
            </p>
            <Button
              size="lg"
              className="mt-4 gap-2 bg-[#104eb3] text-lg hover:bg-[#104eb3]/90"
              onClick={() => setViewState("form")}
            >
              Start Free Audit <ArrowRight size={20} />
            </Button>
            <p className="text-sm text-gray-400">
              No signup required. Takes under 60 seconds.
            </p>
          </motion.div>
        </AnimatePresence>
        <Link
          href="https://github.com/Devansh-365/cited"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-6 flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
          </svg>
          GitHub
        </Link>
      </div>
    );
  }

  // Form view (Typeform-style)
  if (viewState === "form") {
    return (
      <BrandForm questionList={QUESTION_LIST} onSubmit={handleFormSubmit} />
    );
  }

  // Loading view
  if (viewState === "loading") {
    return <AuditProgress brandName={brandNameForLoading} />;
  }

  // Error view
  if (viewState === "error") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-white px-6">
        <div className="flex max-w-md flex-col gap-4">
          {isRateLimited ? (
            <>
              <h2 className="font-serif text-2xl font-medium text-gray-900">
                Daily limit reached
              </h2>
              <p className="text-sm text-gray-400">
                You&apos;ve used all 20 free audits for today. Come back
                tomorrow to run more.
              </p>
              <div className="mt-2">
                <Button
                  variant="outline"
                  className="h-10 rounded-md"
                  onClick={handleReset}
                >
                  Back to home
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-serif text-2xl font-medium text-gray-900">
                Something went wrong
              </h2>
              <p className="text-sm text-gray-400">{error}</p>
              <div className="mt-2">
                <Button
                  className="h-10 rounded-md bg-[#104eb3] text-white hover:bg-[#104eb3]/80"
                  onClick={handleReset}
                >
                  Try again
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Results view
  if (viewState === "results" && auditData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12">
          {/* Header */}
          <div className="mb-8 flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-400">Cited</p>
              <h1 className="font-serif text-3xl font-medium text-gray-900">
                {auditData?.brand.name}
              </h1>
              <p className="text-sm text-gray-400">AI Visibility Report</p>
            </div>
            <Button
              variant="outline"
              className="text-sm"
              onClick={handleReset}
            >
              New Audit
            </Button>
          </div>

          <Separator className="mb-8" />

          <div className="space-y-8">
            {/* Score Card */}
            <ScoreCard
              score={auditData?.visibilityScore ?? 0}
              breakdown={
                auditData?.scoreBreakdown ?? {
                  mentionFrequency: 0,
                  sentimentQuality: 0,
                  platformCoverage: 0,
                  positionStrength: 0,
                  total: 0,
                }
              }
              brandName={auditData?.brand.name ?? ""}
            />

            {/* Competitor Chart */}
            <CompetitorChart
              brandName={auditData?.brand.name ?? ""}
              brandScore={auditData?.visibilityScore ?? 0}
              competitors={auditData?.competitors ?? []}
            />

            {/* Gap Table */}
            <GapTable gaps={auditData?.gaps ?? []} />

            {/* Recommendations */}
            <RecommendationList
              recommendations={auditData?.recommendations ?? []}
              brandName={auditData?.brand.name ?? ""}
            />

          </div>
        </div>
      </div>
    );
  }

  return null;
}
