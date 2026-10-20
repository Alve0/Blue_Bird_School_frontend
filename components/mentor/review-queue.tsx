"use client";

import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { useMentorReviewQueue } from "@/hooks/use-mentor-review-queue";
import { Button } from "@/components/ui/button";
import { LoadingState, Message } from "@/components/ui/feedback";
import { submissionStatusLabel } from "@/lib/api";
import type { Submission } from "@/lib/types";

function dateLabel(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function LinkCell({ href, label }: { href?: string; label: string }) {
  if (!href) return <span className="text-slate-400">—</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer" title={href} className="inline-flex max-w-36 items-center gap-1 truncate text-xs font-medium text-slate-600 hover:text-slate-950 hover:underline">
      <span className="truncate">{label}</span>
      <ExternalLink className="size-3 shrink-0" />
    </a>
  );
}

function StatusBadge({ submission }: { submission: Submission }) {
  const color =
    submission.status === "APPROVED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : submission.status === "REJECTED"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-800";
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${color}`}>
      {submissionStatusLabel(submission.status)}
    </span>
  );
}

export function ReviewQueue({
  pageSize = 10,
  compact = false,
  refreshKey = 0,
  onReviewed,
}: {
  pageSize?: number;
  compact?: boolean;
  refreshKey?: number;
  onReviewed?: () => void;
}) {
  const queue = useMentorReviewQueue(pageSize, refreshKey, onReviewed);
  const canGoBack = queue.page > 1;
  const canGoForward = queue.page < queue.totalPages;

  return (
    <section id="review-queue" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
        <div>
          <h2 className="font-semibold text-slate-900">Project review queue</h2>
          <p className="mt-1 text-sm text-slate-500">
            {queue.loading ? "Loading submissions..." : `${queue.totalItems} submission${queue.totalItems === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span>Status</span>
            <select
              value={queue.filter}
              onChange={(event) => queue.changeFilter(event.target.value as typeof queue.filter)}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </label>
          {compact && (
            <Link href="/mentor/review-queue" className="text-sm font-medium text-slate-800 underline underline-offset-4 hover:text-slate-600">
              View full queue
            </Link>
          )}
        </div>
      </div>

      {queue.notice && <div className="px-5 pt-4 sm:px-6"><Message success={queue.notice.success}>{queue.notice.text}</Message></div>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3.5">Student</th>
              <th className="px-5 py-3.5">Project</th>
              <th className="px-5 py-3.5">Repository</th>
              <th className="px-5 py-3.5">Live application</th>
              <th className="px-5 py-3.5">Submitted</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {queue.loading ? (
              <tr><td colSpan={7}><LoadingState label="Loading review queue..." /></td></tr>
            ) : queue.error ? (
              <tr>
                <td colSpan={7} className="space-y-3 p-5">
                  <Message>{queue.error}</Message>
                  <Button variant="outline" size="sm" onClick={queue.refresh}>Try again</Button>
                </td>
              </tr>
            ) : queue.submissions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center">
                  <p className="font-medium text-slate-800">{queue.filter === "ALL" ? "No submissions to review" : `No ${queue.filter.toLowerCase()} submissions`}</p>
                  <p className="mt-1 text-sm text-slate-500">Submissions matching this view will appear here.</p>
                </td>
              </tr>
            ) : queue.submissions.map((submission) => (
              <tr key={submission.id} className="align-middle hover:bg-slate-50/70">
                <td className="px-5 py-4 text-slate-700">{submission.studentName || "Student"}</td>
                <td className="max-w-52 px-5 py-4"><span title={submission.projectName} className="block truncate font-medium text-slate-900">{submission.projectName}</span></td>
                <td className="px-5 py-4"><LinkCell href={submission.repositoryUrl} label="Open repo" /></td>
                <td className="px-5 py-4"><LinkCell href={submission.liveUrl} label="Open app" /></td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">{dateLabel(submission.createdAt)}</td>
                <td className="px-5 py-4"><StatusBadge submission={submission} /></td>
                <td className="px-5 py-4">
                  {submission.status === "PENDING" ? (
                    <div className="flex items-center gap-2">
                      <Button size="sm" disabled={queue.actionId !== null} onClick={() => void queue.review(submission, "approve")} className="bg-[#14233b] text-white hover:bg-[#243752]">
                        <Check size={14} /> {queue.actionId === submission.id ? "Saving..." : "Approve"}
                      </Button>
                      <Button size="sm" variant="outline" disabled={queue.actionId !== null} onClick={() => void queue.review(submission, "reject")} aria-label={`Reject ${submission.projectName}`}>
                        <X size={14} /> Reject
                      </Button>
                    </div>
                  ) : <span className="text-xs text-slate-400">Reviewed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:px-6">
        <p className="text-xs text-slate-500">Page {queue.page} of {Math.max(1, queue.totalPages)}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={!canGoBack || queue.loading} onClick={() => queue.changePage(Math.max(1, queue.page - 1))}>
            <ChevronLeft size={15} /> Previous
          </Button>
          <Button variant="outline" size="sm" disabled={!canGoForward || queue.loading} onClick={() => queue.changePage(Math.min(queue.totalPages, queue.page + 1))}>
            Next <ChevronRight size={15} />
          </Button>
        </div>
      </div>
    </section>
  );
}
