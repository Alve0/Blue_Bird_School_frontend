"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { RoleGate } from "@/components/role-gate";
import { ReviewQueue } from "@/components/mentor/review-queue";

export default function MentorReviewQueuePage() {
  return (
    <RoleGate role="MENTOR">
      <DashboardShell role="MENTOR" title="Review queue">
        <div className="mb-7">
          <p className="text-sm font-medium text-slate-500">Mentor workspace</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Review queue</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Browse and review student project submissions. Use status filters and pagination to work through the full queue.
          </p>
        </div>
        <ReviewQueue pageSize={25} />
      </DashboardShell>
    </RoleGate>
  );
}
