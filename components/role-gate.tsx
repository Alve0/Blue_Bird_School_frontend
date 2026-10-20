"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { LoadingState, Message } from "@/components/ui/feedback";
import type { UserRole } from "@/lib/types";

export function RoleGate({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const { user, status, error, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && user && user.role !== role) {
      router.replace(user.role === "STUDENT" ? "/student" : "/mentor");
    }
  }, [role, router, status, user]);

  if (status === "loading") return <LoadingState label="Checking your session..." />;
  if (status === "error") {
    return (
      <div className="mx-auto mt-12 max-w-lg space-y-4 px-4">
        <Message>{error || "Unable to connect to the service."}</Message>
        <button
          type="button"
          onClick={() => void refreshUser().catch(() => undefined)}
          className="rounded-lg bg-[#14233b] px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </div>
    );
  }
  if (status !== "authenticated" || !user || user.role !== role) return null;
  return children;
}
