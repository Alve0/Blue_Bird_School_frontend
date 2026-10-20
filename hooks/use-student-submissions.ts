"use client";

import { useCallback, useEffect, useState } from "react";
import { getStudentSubmissions } from "@/lib/api";
import type { Submission } from "@/lib/types";

export function useStudentSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setSubmissions(await getStudentSubmissions());
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getStudentSubmissions()
      .then((items) => {
        if (!active) return;
        setSubmissions(items);
        setError("");
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load submissions.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { submissions, loading, error, refresh };
}
