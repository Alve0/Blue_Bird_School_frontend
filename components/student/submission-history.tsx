"use client";

import { ArrowUpRight, ExternalLink, FolderOpen } from "lucide-react";
import Link from "next/link";
import { LoadingState, Message } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { submissionStatusLabel } from "@/lib/api";
import type { Submission } from "@/lib/types";

function StatusBadge({ status }: { status: Submission["status"] }) {
  const color =
    status === "APPROVED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "REJECTED"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-800";
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${color}`}>
      {submissionStatusLabel(status)}
    </span>
  );
}

function dateLabel(value?: string) {
  if (!value) return "Date not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date not provided"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export function SubmissionHistory({
  submissions,
  loading,
  error,
  onRetry,
}: {
  submissions: Submission[];
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  return (
    <section id="my-submissions" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-700">
            <FolderOpen size={19} />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900">My submissions</h2>
            <p className="mt-1 text-sm text-slate-500">Your projects and their review status.</p>
          </div>
        </div>
        {!loading && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{submissions.length}</span>}
      </div>
      {loading ? (
        <LoadingState label="Loading your submissions..." />
      ) : error ? (
        <div className="space-y-3">
          <Message>{error}</Message>
          <Button variant="outline" onClick={onRetry}>Try again</Button>
        </div>
      ) : submissions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-5 py-10 text-center">
          <FolderOpen className="mx-auto size-8 text-slate-400" />
          <p className="mt-3 text-sm font-medium text-slate-800">No projects submitted yet</p>
          <p className="mt-1 text-sm text-slate-500">Your first submission will show up here.</p>
          <a href="#submit-project" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-900 underline underline-offset-4">
            Submit a project <ArrowUpRight size={14} />
          </a>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {submissions.map((submission) => (
            <li key={submission.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/student/submissions/${encodeURIComponent(submission.id)}`} className="font-medium text-slate-900 hover:underline">
                  {submission.projectName}
                </Link>
                <StatusBadge status={submission.status} />
              </div>
              <p className="mt-1 text-xs text-slate-500">Submitted {dateLabel(submission.createdAt)}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {submission.repositoryUrl && (
                  <a href={submission.repositoryUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-950">
                    Repository <ExternalLink size={12} />
                  </a>
                )}
                {submission.liveUrl && (
                  <a href={submission.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-950">
                    Live app <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
