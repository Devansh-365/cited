"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { auditRequestSchema, type AuditRequestInput } from "@/lib/utils/validators";
import { CATEGORIES } from "@/lib/utils/constants";
import type { CategoryId } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BrandInputFormProps {
  onSubmit: (data: {
    brandName: string;
    websiteUrl: string;
    category: CategoryId;
    competitors: string[];
  }) => void;
  isLoading?: boolean;
}

export default function BrandInputForm({
  onSubmit,
  isLoading,
}: BrandInputFormProps) {
  const [competitorInput, setCompetitorInput] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);

  const form = useForm<AuditRequestInput>({
    resolver: zodResolver(auditRequestSchema),
    defaultValues: {
      brandName: "",
      websiteUrl: "",
      category: undefined,
      competitors: [],
    },
  });

  const selectedCategory = form.watch("category");

  const addCompetitor = () => {
    const name = competitorInput.trim();
    if (name && competitors.length < 5 && !competitors.includes(name)) {
      const updated = [...competitors, name];
      setCompetitors(updated);
      form.setValue("competitors", updated);
      setCompetitorInput("");
    }
  };

  const removeCompetitor = (index: number) => {
    const updated = competitors.filter((_, i) => i !== index);
    setCompetitors(updated);
    form.setValue("competitors", updated);
  };

  const handleFormSubmit = (data: AuditRequestInput) => {
    onSubmit({
      brandName: data.brandName,
      websiteUrl: data.websiteUrl || "",
      category: data.category as CategoryId,
      competitors,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Check Your AI Visibility</CardTitle>
        <CardDescription>
          Find out if ChatGPT, Perplexity, and Google AI recommend your brand —
          or your competitors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            {/* Brand Name */}
            <FormField
              control={form.control}
              name="brandName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., mCaffeine"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website URL */}
            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Website URL{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://mcaffeine.com"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Helps disambiguate brands with common names
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategory && (
                    <FormDescription>
                      Examples:{" "}
                      {
                        CATEGORIES.find((c) => c.id === selectedCategory)
                          ?.examples
                      }
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Competitors */}
            <div className="space-y-2">
              <FormLabel>
                Competitors{" "}
                <span className="text-muted-foreground font-normal">
                  (optional, max 5 — we&apos;ll auto-detect too)
                </span>
              </FormLabel>
              <div className="flex gap-2">
                <Input
                  value={competitorInput}
                  onChange={(e) => setCompetitorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCompetitor();
                    }
                  }}
                  placeholder="e.g., Mamaearth"
                  disabled={isLoading || competitors.length >= 5}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addCompetitor}
                  disabled={
                    isLoading ||
                    competitors.length >= 5 ||
                    !competitorInput.trim()
                  }
                >
                  Add
                </Button>
              </div>
              {competitors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {competitors.map((comp, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="gap-1 cursor-pointer hover:bg-destructive/10"
                      onClick={() => !isLoading && removeCompetitor(i)}
                    >
                      {comp}
                      <span className="ml-1 text-muted-foreground hover:text-destructive">
                        ×
                      </span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Running Audit...
                </>
              ) : (
                "Check My AI Visibility →"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
