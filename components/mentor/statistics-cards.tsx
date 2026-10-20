"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Message } from "@/components/ui/feedback";
import { getMentorStatistics, submissionStatusLabel } from "@/lib/api";
import type { MentorStatistics, SubmissionStatus } from "@/lib/types";

const cards: {
  key: keyof Pick<MentorStatistics, "pending" | "approved" | "rejected">;
  label: string;
  tone: string;
}[] = [
  { key: "pending", label: "Total pending", tone: "bg-amber-50 text-amber-700" },
  { key: "approved", label: "Total approved", tone: "bg-emerald-50 text-emerald-700" },
  { key: "rejected", label: "Total rejected", tone: "bg-red-50 text-red-700" },
];

export function StatisticsCards({ refreshKey = 0 }: { refreshKey?: number }) {
  const [statistics, setStatistics] = useState<MentorStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    void getMentorStatistics()
      .then((result) => {
        if (!active) return;
        setStatistics(result);
        setError("");
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load statistics.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey, retryKey]);

  return (
    <>
      <section aria-label="Submission statistics" className="mb-7 grid gap-4 sm:grid-cols-3">
        {cards.map(({ key, label, tone }) => (
          <article key={key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-600">{label}</p>
              <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${tone}`}>
                {key === "pending" ? "Awaiting review" : submissionStatusLabel(key.toUpperCase() as SubmissionStatus)}
              </span>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {loading ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-100" /> : statistics?.[key] ?? "—"}
            </p>
          </article>
        ))}
      </section>
      {error && (
        <div className="mb-6 space-y-2">
          <Message>{error}</Message>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setRetryKey((value) => value + 1);
            }}
          >
            Retry statistics
          </Button>
        </div>
      )}
    </>
  );
}
