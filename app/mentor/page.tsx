"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { RoleGate } from "@/components/role-gate";
import { ReviewQueue } from "@/components/mentor/review-queue";
import { StatisticsCards } from "@/components/mentor/statistics-cards";
import { Button } from "@/components/ui/button";

function MentorOverview() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((value) => value + 1), []);

  return (
    <RoleGate role="MENTOR">
      <DashboardShell role="MENTOR" title="Dashboard overview">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Mentor workspace</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Dashboard overview</h1>
            <p className="mt-2 text-sm text-slate-600">Review student projects and track submission progress.</p>
          </div>
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>
        <StatisticsCards refreshKey={refreshKey} />
        <ReviewQueue
          pageSize={10}
          compact
          refreshKey={refreshKey}
          onReviewed={refresh}
        />
      </DashboardShell>
    </RoleGate>
  );
}

export default function MentorPage() {
  return <MentorOverview />;
}
