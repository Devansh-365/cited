"use client";

import { useState } from "react";
import BrandInputForm from "@/components/audit/BrandInputForm";
import AuditProgress from "@/components/audit/AuditProgress";
import ScoreCard from "@/components/audit/ScoreCard";
import CompetitorChart from "@/components/audit/CompetitorChart";
import GapTable from "@/components/audit/GapTable";
import RecommendationList from "@/components/audit/RecommendationList";
import type { AuditResponse, CategoryId } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ViewState = "form" | "loading" | "results" | "error";

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>("form");
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [brandNameForLoading, setBrandNameForLoading] = useState("");

  const handleSubmit = async (data: {
    brandName: string;
    websiteUrl: string;
    category: CategoryId;
    competitors: string[];
  }) => {
    setBrandNameForLoading(data.brandName);
    setViewState("loading");
    setError("");

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: data.brandName,
          websiteUrl: data.websiteUrl || undefined,
          category: data.category,
          competitors:
            data.competitors.length > 0 ? data.competitors : undefined,
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
    setViewState("form");
    setAuditData(null);
    setError("");
  };

  // Form view
  if (viewState === "form") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Is AI recommending your brand?
          </h1>
          <p className="text-muted-foreground text-lg">
            Find out in 60 seconds. Check your visibility across ChatGPT,
            Perplexity, and Google AI.
          </p>
        </div>
        <BrandInputForm onSubmit={handleSubmit} />
      </div>
    );
  }

  // Loading view
  if (viewState === "loading") {
    return <AuditProgress brandName={brandNameForLoading} />;
  }

  // Error view
  if (viewState === "error") {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold">Audit Failed</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={handleReset} variant="outline">
              ← Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results view
  if (viewState === "results" && auditData) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">AI Visibility Report</h1>
            <p className="text-muted-foreground">
              Results for{" "}
              <span className="font-semibold text-foreground">
                {auditData.brand.name}
              </span>
            </p>
          </div>
          <Button variant="outline" onClick={handleReset}>
            ← New Audit
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
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-center space-y-3">
            <h3 className="text-lg font-semibold">
              Want us to fix this for you?
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              UpCited has helped brands like Fizz and Awaken.tax get into
              ChatGPT&apos;s recommendations within 6 months. We can do the same
              for {auditData.brand.name}.
            </p>
            <Button size="lg" asChild>
              <a
                href="https://upcited.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a 15-min call →
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
