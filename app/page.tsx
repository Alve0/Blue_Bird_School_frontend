"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { LoadingState, Message } from "@/components/ui/feedback";

export default function HomePage() {
  const { user, status, error, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(user.role === "STUDENT" ? "/student" : "/mentor");
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status, user]);

  if (status === "error") {
    return (
      <main className="mx-auto mt-16 max-w-lg space-y-4 px-4">
        <Message>{error || "Could not connect to the application service."}</Message>
        <button
          type="button"
          onClick={() => void refreshUser().catch(() => undefined)}
          className="rounded-lg bg-[#14233b] px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </main>
    );
  }
  return <LoadingState label="Restoring your session..." />;
}
