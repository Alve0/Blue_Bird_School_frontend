"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { Message } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { loginSchema, signupSchema, type LoginValues, type SignupValues } from "@/lib/schemas";

function FieldError({ children }: { children?: string }) {
  return children ? <p className="mt-1 text-xs text-red-600">{children}</p> : null;
}

function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[#14233b] text-white">
            <GraduationCap size={21} />
          </span>
          <span className="text-sm font-semibold text-slate-900">Bluebird School</span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        <div className="mt-7">{children}</div>
      </section>
    </main>
  );
}

const inputClass =
  "mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

export function LoginForm() {
  const { signIn, status, user, error: sessionError } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [requestError, setRequestError] = useState("");
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const loading = form.formState.isSubmitting;

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(user.role === "STUDENT" ? "/student" : "/mentor");
    }
  }, [router, status, user]);

  async function onSubmit(values: LoginValues) {
    setRequestError("");
    try {
      const authenticatedUser = await signIn(values.email, values.password);
      toast.success("Signed in successfully.");
      router.replace(authenticatedUser.role === "STUDENT" ? "/student" : "/mentor");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign in failed.";
      setRequestError(message);
      toast.error(message);
    }
  }

  return (
    <AuthLayout title="Welcome back" description="Sign in to continue to your project workspace.">
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        {requestError && <Message>{requestError}</Message>}
        {status === "error" && sessionError && !requestError && <Message>{sessionError}</Message>}
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            {...form.register("email")}
            className={inputClass}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <FieldError>{form.formState.errors.email?.message}</FieldError>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <span className="relative block">
            <input
              {...form.register("password")}
              className={`${inputClass} pr-12`}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
          <FieldError>{form.formState.errors.password?.message}</FieldError>
        </label>
        <Button type="submit" disabled={loading} className="h-11 w-full rounded-lg bg-[#14233b] text-white hover:bg-[#243752]">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        New student?{" "}
        <Link href="/signup" className="font-medium text-slate-900 underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

export function SignupForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [success, setSuccess] = useState("");
  const form = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });
  const loading = form.formState.isSubmitting;

  async function onSubmit(values: SignupValues) {
    setRequestError("");
    setSuccess("");
    try {
      await signUp(values.name, values.email, values.password);
      setSuccess("Account created. Please sign in to continue.");
      toast.success("Account created. Please sign in to continue.");
      window.setTimeout(() => router.replace("/login"), 1200);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed.";
      setRequestError(message);
      toast.error(message);
    }
  }

  return (
    <AuthLayout title="Create your student account" description="Join your cohort and share your project work.">
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        {requestError && <Message>{requestError}</Message>}
        {success && <Message success>{success}</Message>}
        <label className="block text-sm font-medium text-slate-700">
          Full name
          <input
            {...form.register("name")}
            className={inputClass}
            autoComplete="name"
            placeholder="Your name"
          />
          <FieldError>{form.formState.errors.name?.message}</FieldError>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            {...form.register("email")}
            className={inputClass}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <FieldError>{form.formState.errors.email?.message}</FieldError>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <span className="relative block">
            <input
              {...form.register("password")}
              className={`${inputClass} pr-12`}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
          <FieldError>{form.formState.errors.password?.message}</FieldError>
        </label>
        <Button type="submit" disabled={loading} className="h-11 w-full rounded-lg bg-[#14233b] text-white hover:bg-[#243752]">
          {loading ? "Creating account..." : "Create student account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-slate-900 underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
