"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getMentorSubmissions, reviewSubmission } from "@/lib/api";
import type { Submission, SubmissionStatus } from "@/lib/types";

export type ReviewStatusFilter = "ALL" | SubmissionStatus;

export function useMentorReviewQueue(
  pageSize: number,
  externalRefreshKey = 0,
  onReviewed?: () => void,
) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<ReviewStatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; success: boolean } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const requestVersion = useRef(0);

  useEffect(() => {
    const version = ++requestVersion.current;
    void getMentorSubmissions(filter, page, pageSize)
      .then((result) => {
        if (requestVersion.current !== version) return;
        setSubmissions(result.submissions);
        setError("");
        setTotalPages(result.pageInfo.totalPages);
        setTotalItems(result.pageInfo.totalItems);
        if (result.pageInfo.page !== page) setPage(result.pageInfo.page);
      })
      .catch((reason: unknown) => {
        if (requestVersion.current !== version) return;
        setError(reason instanceof Error ? reason.message : "Could not load the review queue.");
      })
      .finally(() => {
        if (requestVersion.current === version) setLoading(false);
      });
    return () => {
      requestVersion.current += 1;
    };
  }, [externalRefreshKey, filter, page, pageSize, refreshKey]);

  const changeFilter = useCallback((nextFilter: ReviewStatusFilter) => {
    setLoading(true);
    setError("");
    setFilter(nextFilter);
    setPage(1);
  }, []);

  const changePage = useCallback((nextPage: number) => {
    setLoading(true);
    setError("");
    setPage(nextPage);
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    setError("");
    setRefreshKey((value) => value + 1);
  }, []);

  const review = useCallback(async (submission: Submission, action: "approve" | "reject") => {
    if (
      action === "reject" &&
      !window.confirm(`Reject "${submission.projectName}"? This action will be sent to the backend.`)
    ) {
      return;
    }
    setActionId(submission.id);
    setNotice(null);
    try {
      await reviewSubmission(submission.id, action);
      setNotice({
        text: `Submission ${action === "approve" ? "approved" : "rejected"}. Refreshing dashboard data...`,
        success: true,
      });
      toast.success(`Submission ${action === "approve" ? "approved" : "rejected"}.`);
      setLoading(true);
      setRefreshKey((value) => value + 1);
      onReviewed?.();
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "The review action could not be completed.";
      setNotice({
        text: message,
        success: false,
      });
      toast.error(message);
    } finally {
      setActionId(null);
    }
  }, [onReviewed]);

  return {
    submissions,
    filter,
    page,
    pageSize,
    totalPages,
    totalItems,
    loading,
    error,
    actionId,
    notice,
    changeFilter,
    changePage,
    refresh,
    review,
  };
}
