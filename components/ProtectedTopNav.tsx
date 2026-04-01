"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/interview", label: "Interview" },
  { href: "/review", label: "Review" },
];

export default function ProtectedTopNav() {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const activeClass =
    "flex items-center gap-3 rounded-lg border-r-4 border-[#4edea3] bg-gradient-to-r from-[#4edea3]/10 to-transparent px-4 py-3 text-sm font-medium text-[#4edea3]";
  const defaultClass =
    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#cec5bf]/70 transition hover:bg-[#2a2a2a] hover:text-[#cec5bf]";

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-[#4edea3]/10 bg-[#1c1b1b] p-6 lg:flex">
        <Link href="/dashboard" className="text-2xl font-bold tracking-tighter text-[#4edea3]">
          ClearCue
        </Link>
        <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#cec5bf]/60">
          Digital Auteur Studio
        </p>

        <nav className="mt-10 flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? activeClass : defaultClass}
              >
                <span className="material-symbols-outlined text-base">
                  {item.href === "/dashboard"
                    ? "dashboard"
                    : item.href === "/interview"
                      ? "mic_external_on"
                      : "rate_review"}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-auto flex items-center gap-3 rounded-lg border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:border-rose-400"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          Sign Out
        </button>
      </aside>

      <header className="sticky top-0 z-40 border-b border-[#404945]/30 bg-[#131313]/80 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-[#4edea3]">
            ClearCue
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-rose-500/50 bg-rose-950/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-rose-200"
          >
            Sign Out
          </button>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-[#404945]/40 bg-[#1c1b1b]/90 px-4 pb-5 pt-3 backdrop-blur lg:hidden">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-24 flex-col items-center rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition ${
                isActive
                  ? "bg-[#4edea3]/10 text-[#4edea3]"
                  : "text-[#cec5bf]/60"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {item.href === "/dashboard"
                  ? "home"
                  : item.href === "/interview"
                    ? "psychology"
                    : "history_edu"}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
