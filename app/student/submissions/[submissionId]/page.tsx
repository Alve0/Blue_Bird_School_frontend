import { Suspense } from "react";
import { StudentSubmissionDetail } from "@/components/student-submission-detail";
import { LoadingState } from "@/components/ui/feedback";

async function SubmissionPageContent({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  return <StudentSubmissionDetail submissionId={submissionId} />;
}

export default function SubmissionDetailPage(props: {
  params: Promise<{ submissionId: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState label="Opening submission..." />}>
      <SubmissionPageContent params={props.params} />
    </Suspense>
  );
}
