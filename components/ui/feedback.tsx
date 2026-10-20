import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function Message({
  children,
  success = false,
}: {
  children: string;
  success?: boolean;
}) {
  const Icon = success ? CheckCircle2 : AlertCircle;
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
      role={success ? "status" : "alert"}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
