"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Circle, ExternalLink, FileText, Link2, Plus, Sparkles, Send } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Message } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { createStudentSubmission } from "@/lib/api";
import { submissionSchema, type SubmissionValues } from "@/lib/schemas";

const controlClass =
  "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

export function SubmissionForm({
  onSubmitted,
}: {
  onSubmitted?: () => Promise<void>;
}) {
  const [notice, setNotice] = useState<{ text: string; success: boolean } | null>(null);
  const form = useForm<SubmissionValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { projectName: "", repoUrl: "", liveLink: "", description: "" },
  });
  const values = useWatch({ control: form.control });
  const projectName = values.projectName?.trim() ?? "";
  const repoUrl = values.repoUrl?.trim() ?? "";
  const liveLink = values.liveLink?.trim() ?? "";
  const description = values.description?.trim() ?? "";
  const repoIsValid = (() => {
    try {
      const url = new URL(repoUrl);
      return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
    } catch {
      return false;
    }
  })();
  const checklist = [
    { label: "Project name added", complete: projectName.length >= 2 },
    { label: "Repository link is valid", complete: repoIsValid },
    { label: "Description is detailed enough", complete: description.length >= 20 && description.length <= 2000 },
  ];
  const readiness = Math.round(
    (checklist.filter((item) => item.complete).length / checklist.length) * 100,
  );
  const liveLinkIsValid = (() => {
    if (!liveLink) return false;
    try {
      const url = new URL(liveLink);
      return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
    } catch {
      return false;
    }
  })();

  async function onSubmit(values: SubmissionValues) {
    setNotice(null);
    try {
      await createStudentSubmission(values);
      form.reset();
      setNotice({ text: "Project submitted successfully.", success: true });
      toast.success("Project submitted successfully.");
      await onSubmitted?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Your project could not be submitted.";
      setNotice({
        text: message,
        success: false,
      });
      toast.error(message);
    }
  }

  const fieldError = (key: keyof SubmissionValues) => form.formState.errors[key]?.message;

  return (
    <section id="submit-project" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-700">
          <Plus size={19} />
        </span>
        <div>
          <h2 className="font-semibold text-slate-900">Submit a project</h2>
          <p className="mt-1 text-sm text-slate-500">Add your project details for mentor review.</p>
        </div>
      </div>
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.3fr)_minmax(240px,0.7fr)]">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          {notice && <Message success={notice.success}>{notice.text}</Message>}
          <label className="block text-sm font-medium text-slate-700">
            Project name
            <input {...form.register("projectName")} className={controlClass} placeholder="e.g. Campus events app" />
            {fieldError("projectName") && <span className="mt-1 block text-xs text-red-600">{fieldError("projectName")}</span>}
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Repository URL
            <input {...form.register("repoUrl")} className={controlClass} type="url" placeholder="https://github.com/you/project" />
            {fieldError("repoUrl") && <span className="mt-1 block text-xs text-red-600">{fieldError("repoUrl")}</span>}
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Live application URL <span className="font-normal text-slate-400">(optional)</span>
            <input {...form.register("liveLink")} className={controlClass} type="url" placeholder="https://your-app.com" />
            {fieldError("liveLink") && <span className="mt-1 block text-xs text-red-600">{fieldError("liveLink")}</span>}
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Project description
            <textarea
              {...form.register("description")}
              className={`${controlClass} min-h-32 resize-y`}
              placeholder="What does your project do? Which tools or technologies did you use?"
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">{description.length}/2,000 characters · minimum 20</span>
            {fieldError("description") && <span className="mt-1 block text-xs text-red-600">{fieldError("description")}</span>}
          </label>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="h-11 w-full rounded-lg bg-[#14233b] text-white hover:bg-[#243752]"
          >
            <Send size={16} />
            {form.formState.isSubmitting ? "Submitting project..." : "Submit project"}
          </Button>
        </form>

        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Sparkles className="size-4 text-indigo-600" />
                Submission readiness
              </div>
              <span className="text-sm font-semibold tabular-nums text-slate-700">{readiness}%</span>
            </div>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-label="Submission readiness"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={readiness}
            >
              <div
                className="h-full rounded-full bg-indigo-600 transition-[width] duration-300"
                style={{ width: `${readiness}%` }}
              />
            </div>
            <ul className="mt-4 space-y-3">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5 text-xs text-slate-600">
                  {item.complete ? (
                    <Check aria-hidden="true" className="size-4 shrink-0 text-emerald-600" />
                  ) : (
                    <Circle aria-hidden="true" className="size-4 shrink-0 text-slate-300" />
                  )}
                  {item.label}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-500">
              A live demo is optional, but helps your mentor try the project without setup.
            </p>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mentor preview</p>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-start gap-2.5">
                <FileText className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-slate-900">
                    {projectName || "Your project name"}
                  </p>
                  <p className="mt-1 line-clamp-3 min-h-10 whitespace-pre-wrap text-xs leading-5 text-slate-500">
                    {description || "Your project description will appear here."}
                  </p>
                </div>
              </div>
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <PreviewLink href={repoUrl} label="Repository" valid={repoIsValid} />
                {liveLink && <PreviewLink href={liveLink} label="Live demo" valid={liveLinkIsValid} />}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

function PreviewLink({
  href,
  label,
  valid,
}: {
  href: string;
  label: string;
  valid: boolean;
}) {
  const Icon = label === "Repository" ? Link2 : ExternalLink;
  return (
    <div className="flex min-w-0 items-center gap-2 text-xs">
      <Icon className={`size-3.5 shrink-0 ${valid ? "text-slate-500" : "text-slate-300"}`} />
      {valid ? (
        <a href={href} target="_blank" rel="noreferrer" className="truncate text-slate-700 hover:underline">
          {label}: {href}
        </a>
      ) : (
        <span className="truncate text-slate-400">{label}: Add a valid link</span>
      )}
    </div>
  );
}
