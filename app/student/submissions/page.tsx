"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { RoleGate } from "@/components/role-gate";
import { SubmissionHistory } from "@/components/student/submission-history";
import { useStudentSubmissions } from "@/hooks/use-student-submissions";

export default function StudentSubmissionsPage() {
  const { submissions, loading, error, refresh } = useStudentSubmissions();

  return (
    <RoleGate role="STUDENT">
      <DashboardShell role="STUDENT" title="My submissions">
        <div className="mb-7">
          <p className="text-sm font-medium text-slate-500">Student workspace</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">My submissions</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Review the status and details of your submitted projects.
          </p>
        </div>
        <SubmissionHistory
          submissions={submissions}
          loading={loading}
          error={error}
          onRetry={() => void refresh()}
        />
      </DashboardShell>
    </RoleGate>
  );
}
