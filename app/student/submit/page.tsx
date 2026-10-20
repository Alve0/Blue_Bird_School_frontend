"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { RoleGate } from "@/components/role-gate";
import { SubmissionForm } from "@/components/student/submission-form";

export default function StudentSubmitPage() {
  return (
    <RoleGate role="STUDENT">
      <DashboardShell role="STUDENT" title="Submit project">
        <div className="mb-7">
          <p className="text-sm font-medium text-slate-500">Student workspace</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Submit a project</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Share your repository and live application with your mentor for review.
          </p>
        </div>
        <div className="max-w-3xl">
          <SubmissionForm />
        </div>
      </DashboardShell>
    </RoleGate>
  );
}
