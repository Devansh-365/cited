"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

import BrandForm, { ResponseItem } from "@/components/audit/brand-form";
import AuditProgress from "@/components/audit/AuditProgress";
import ScoreCard from "@/components/audit/ScoreCard";
import CompetitorChart from "@/components/audit/CompetitorChart";
import GapTable from "@/components/audit/GapTable";
import RecommendationList from "@/components/audit/RecommendationList";
import type { AuditResponse, CategoryId } from "@/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

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

    setBrandNameForLoading(brandName);
    setViewState("loading");
    setError("");

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          websiteUrl: websiteUrl || undefined,
          category,
          competitors: competitors.length > 0 ? competitors : undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
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
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#104eb3]">
              <span className="text-2xl font-bold text-white">C</span>
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
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
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <AuditProgress brandName={brandNameForLoading} />
      </div>
    );
  }

  // Error view
  if (viewState === "error") {
    return (
      <div className="flex h-screen w-screen items-center justify-center px-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-2xl">!</span>
            </div>
            <h2 className="font-serif text-xl font-semibold">Audit Failed</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={handleReset} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results view
  if (viewState === "results" && auditData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold">AI Visibility Report</h1>
              <p className="text-muted-foreground">
                Results for{" "}
                <span className="font-semibold text-foreground">
                  {auditData.brand.name}
                </span>
              </p>
            </div>
            <Button variant="outline" onClick={handleReset}>
              New Audit
            </Button>
          </div>

          <Separator />

          {/* Score Card */}
          <ScoreCard
            score={auditData.visibilityScore ?? 0}
            breakdown={
              auditData.scoreBreakdown ?? {
                mentionFrequency: 0,
                sentimentQuality: 0,
                platformCoverage: 0,
                positionStrength: 0,
                total: 0,
              }
            }
            brandName={auditData.brand.name}
          />

          {/* Competitor Chart */}
          <CompetitorChart
            brandName={auditData.brand.name}
            brandScore={auditData.visibilityScore ?? 0}
            competitors={auditData.competitors}
          />

          {/* Gap Table */}
          <GapTable gaps={auditData.gaps} />

          {/* Recommendations */}
          <RecommendationList
            recommendations={auditData.recommendations}
            brandName={auditData.brand.name}
          />

          {/* UpCited CTA */}
          <Card className="border-[#104eb3]/20 bg-[#104eb3]/5">
            <CardContent className="pt-6 text-center space-y-3">
              <h3 className="font-serif text-lg font-semibold">
                Want us to fix this for you?
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                UpCited has helped brands get into ChatGPT&apos;s
                recommendations within 6 months. We can do the same for{" "}
                {auditData.brand.name}.
              </p>
              <Button size="lg" className="bg-[#104eb3] hover:bg-[#104eb3]/90" asChild>
                <a
                  href="https://upcited.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book a 15-min call
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
