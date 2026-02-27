"use client";

import type { Gap } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface GapTableProps {
  gaps: Gap[];
}

const priorityVariant: Record<string, "destructive" | "secondary" | "outline"> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

const platformLabels: Record<string, string> = {
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  google_ai: "Google AI",
};

export default function GapTable({ gaps }: GapTableProps) {
  if (gaps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Where You&apos;re Missing</CardTitle>
          <CardDescription>
            No significant gaps found — your brand has some presence across AI
            platforms. Keep monitoring!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Where You&apos;re Missing</CardTitle>
        <CardDescription>
          {gaps.length} gaps found — queries where competitors appear but you
          don&apos;t
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Priority</TableHead>
              <TableHead>Query</TableHead>
              <TableHead className="w-[100px]">Platform</TableHead>
              <TableHead>Competitors Present</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gaps.slice(0, 12).map((gap, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Badge variant={priorityVariant[gap.priority]}>
                    {gap.priority.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  &quot;{gap.prompt}&quot;
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {platformLabels[gap.platform] || gap.platform}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {gap.competitorsPresent.join(", ")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {gaps.length > 12 && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            + {gaps.length - 12} more gaps
          </p>
        )}
      </CardContent>
    </Card>
  );
}
