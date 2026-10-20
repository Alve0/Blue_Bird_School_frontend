"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, Clock3, PlusCircle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { RoleGate } from "@/components/role-gate";
import { useStudentSubmissions } from "@/hooks/use-student-submissions";
import { LoadingState, Message } from "@/components/ui/feedback";

function dateLabel(value?: string) {
  if (!value) return "Date not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date not provided"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export function StudentOverview() {
  const { submissions, loading, error, refresh } = useStudentSubmissions();
  const pendingCount = submissions.filter((submission) => submission.status === "PENDING").length;
  const latestSubmission = submissions[0];

  return (
    <RoleGate role="STUDENT">
      <DashboardShell role="STUDENT" title="Student dashboard">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Your workspace</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Track your project reviews and share your latest work with your mentor.
            </p>
          </div>
          <Link
            href="/student/submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#14233b] px-4 text-sm font-medium text-white transition hover:bg-[#243752]"
          >
            <PlusCircle size={16} />
            Submit a project
          </Link>
        </div>

        <section aria-label="Submission overview" className="mb-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-700">
                <ClipboardList size={19} />
              </span>
              <span className="text-sm font-medium text-slate-600">Total submissions</span>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {loading ? "—" : error ? "—" : submissions.length}
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-amber-50 text-amber-700">
                <Clock3 size={19} />
              </span>
              <span className="text-sm font-medium text-slate-600">Awaiting review</span>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {loading ? "—" : error ? "—" : pendingCount}
            </p>
          </article>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Latest submission</h2>
              <p className="mt-1 text-sm text-slate-500">A quick look at your most recent project.</p>
            </div>
            <Link
              href="/student/submissions"
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-950"
            >
              View all submissions <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-5">
            {loading ? (
              <LoadingState label="Loading your overview..." />
            ) : error ? (
              <div className="space-y-3">
                <Message>{error}</Message>
                <button
                  type="button"
                  onClick={() => void refresh()}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Try again
                </button>
              </div>
            ) : latestSubmission ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link
                    href={`/student/submissions/${encodeURIComponent(latestSubmission.id)}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {latestSubmission.projectName}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">
                    Submitted {dateLabel(latestSubmission.createdAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                    latestSubmission.status === "APPROVED"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : latestSubmission.status === "REJECTED"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                >
                  {latestSubmission.status[0] +
                    latestSubmission.status.slice(1).toLowerCase()}
                </span>
              </div>
            ) : (
              <div className="py-5 text-center">
                <p className="text-sm font-medium text-slate-800">No projects submitted yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  When you submit your first project, its review status will appear here.
                </p>
                <Link
                  href="/student/submit"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-900 underline underline-offset-4"
                >
                  Submit your first project <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </section>
      </DashboardShell>
    </RoleGate>
  );
}
