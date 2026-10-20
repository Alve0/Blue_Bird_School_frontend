"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpenCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/types";

const navigation = {
  STUDENT: [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/submit", label: "Submit project", icon: PlusCircle },
    { href: "/student/submissions", label: "My submissions", icon: ClipboardList },
  ],
  MENTOR: [
    { href: "/mentor", label: "Overview", icon: LayoutDashboard },
    { href: "/mentor/review-queue", label: "Review queue", icon: BookOpenCheck },
  ],
};

export function DashboardShell({
  role,
  title,
  children,
}: {
  role: UserRole;
  title: string;
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  async function handleSignOut() {
    setSignOutError("");
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      const message =
        error instanceof Error
          ? `${error.message} You have been signed out on this device.`
          : "Could not contact sign out service. You have been signed out on this device.";
      setSignOutError(
        message,
      );
      toast.error(message);
      router.replace("/login");
    }
  }

  const items = navigation[role];

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <Link href={role === "STUDENT" ? "/student" : "/mentor"} className="flex h-20 items-center gap-3 px-6">
          <span className="grid size-10 place-items-center rounded-xl bg-[#14233b] text-white">
            {role === "STUDENT" ? <GraduationCap size={21} /> : <ShieldCheck size={21} />}
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-900">Bluebird School</span>
            <span className="text-xs text-slate-500">Project workspace</span>
          </span>
        </Link>
        <div className="px-4 pb-2 pt-7 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Workspace
        </div>
        <nav className="space-y-1 px-3">
          {items.map(({ href, label, icon: Icon }) => {
            const active = href.includes("#")
              ? pathname === href.split("#")[0]
              : href === "/mentor" || href === "/student"
                ? pathname === href
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-slate-100 font-medium text-[#14233b]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <Icon aria-hidden="true" size={17} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="mb-3 flex items-center gap-3 px-1">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
              {(user?.name || "U").slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">
                {user?.name || "Signed in"}
              </span>
              <span className="block truncate text-xs text-slate-500">{user?.email}</span>
            </span>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleSignOut}>
            <LogOut size={16} />
            Sign out
          </Button>
          {signOutError && <p role="status" className="mt-2 text-xs text-amber-700">{signOutError}</p>}
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 md:hidden"
            >
              <Menu size={18} />
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="hidden text-xs text-slate-500 sm:block">
                {role === "STUDENT" ? "Student portal" : "Mentor workspace"}
              </p>
            </div>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            {role === "STUDENT" ? "Student" : "Mentor"}
          </span>
        </header>
        {menuOpen && (
          <nav className="space-y-1 border-b border-slate-200 bg-white p-3 md:hidden">
            {items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              <LogOut size={17} /> Sign out
            </button>
          </nav>
        )}
        <main className="mx-auto max-w-[1440px] p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
