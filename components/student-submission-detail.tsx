"use client";

import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { RoleGate } from "@/components/role-gate";
import { LoadingState, Message } from "@/components/ui/feedback";
import { getSubmission, submissionStatusLabel } from "@/lib/api";
import type { Submission } from "@/lib/types";

export function StudentSubmissionDetail({ submissionId }: { submissionId: string }) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getSubmission(submissionId)
      .then((result) => {
        if (active) setSubmission(result);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load this submission.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [submissionId]);

  return (
    <RoleGate role="STUDENT">
      <DashboardShell role="STUDENT" title="Submission details">
        <Link href="/student#my-submissions" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
          <ArrowLeft size={16} /> Back to submissions
        </Link>
        <section className="mt-5 max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? <LoadingState label="Loading submission..." /> : error ? <Message>{error}</Message> : submission ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Project submission</p>
                  <h1 className="mt-1 text-2xl font-semibold text-slate-950">{submission.projectName}</h1>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                  {submissionStatusLabel(submission.status)}
                </span>
              </div>
              {submission.description && <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-700">{submission.description}</p>}
              <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-5">
                {submission.repositoryUrl && <a className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:underline" href={submission.repositoryUrl} target="_blank" rel="noreferrer">Repository <ExternalLink size={14} /></a>}
                {submission.liveUrl && <a className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:underline" href={submission.liveUrl} target="_blank" rel="noreferrer">Live application <ExternalLink size={14} /></a>}
              </div>
            </>
          ) : null}
        </section>
      </DashboardShell>
    </RoleGate>
  );
}
