import Link from "next/link";

import ProtectedTopNav from "@/components/ProtectedTopNav";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-[#131313] text-[#e5e2e1]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(78,222,163,0.12),transparent_35%),radial-gradient(circle_at_90%_5%,rgba(255,185,95,0.1),transparent_28%)]" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-28 pt-4 sm:px-8 lg:ml-64 lg:max-w-none lg:px-12 lg:pb-12 lg:pt-8">
        <ProtectedTopNav />

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="soft-grain rounded-xl border border-[#404945]/30 bg-[#201f1f] p-6 sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffb95f]">Studio Session Active</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Good Morning, <span className="text-[#4edea3]">{session?.user.name ?? "Auteur"}</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-[#cec5bf] sm:text-base">
              Signed in as {session?.user.email ?? "unknown"}. Your performance trend is climbing this week. Keep the momentum with one focused session today.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/interview"
                className="auteur-gradient rounded-lg px-5 py-3 text-sm font-bold text-[#003824] transition hover:brightness-110"
              >
                Start New Interview
              </Link>
              <Link
                href="/review"
                className="rounded-lg border border-[#404945] bg-[#2a2a2a]/70 px-5 py-3 text-sm font-bold text-[#e5e2e1] transition hover:border-[#4edea3]"
              >
                Review Last Session
              </Link>
              <Link
                href="/"
                className="rounded-lg border border-[#404945] bg-[#1c1b1b] px-5 py-3 text-sm font-bold text-[#cec5bf] transition hover:text-[#4edea3]"
              >
                Back Home
              </Link>
            </div>
          </article>

          <article className="rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a938f]">Weekly Target</p>
            <p className="mt-4 text-4xl font-bold text-[#e5e2e1]">
              3 <span className="text-[#8a938f]">/ 5</span>
            </p>
            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-[#0e0e0e]">
              <div className="auteur-gradient h-full w-[60%] rounded-full" />
            </div>
            <p className="mt-4 text-xs text-[#cec5bf]">2 more sessions to hit your cadence target.</p>
          </article>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-xl border border-[#404945]/30 bg-[#201f1f] p-6 transition hover:bg-[#2a2a2a]">
            <div className="mb-4 inline-flex rounded-lg bg-[#00402a] p-3 text-[#4edea3]">
              <span className="material-symbols-outlined">add_circle</span>
            </div>
            <h2 className="text-2xl font-bold">Start New Interview</h2>
            <p className="mt-2 text-sm text-[#cec5bf]">Enter the simulation with role-specific voice prompts and live transcripts.</p>
          </article>

          <article className="rounded-xl border border-[#404945]/30 bg-[#201f1f] p-6 transition hover:bg-[#2a2a2a]">
            <div className="mb-4 inline-flex rounded-lg bg-[#503000] p-3 text-[#ffb95f]">
              <span className="material-symbols-outlined">replay</span>
            </div>
            <h2 className="text-2xl font-bold">Review Last Session</h2>
            <p className="mt-2 text-sm text-[#cec5bf]">Inspect strengths and improvement tips from your latest answers.</p>
          </article>

          <article className="rounded-xl border border-[#404945]/30 bg-gradient-to-br from-[#201f1f] to-[#1c1b1b] p-6 md:col-span-2 xl:col-span-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a938f]">Review Snapshot</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#4edea3]/30">
                <span className="text-2xl font-bold text-[#4edea3]">84</span>
              </div>
              <div>
                <p className="text-lg font-bold">Strong confidence</p>
                <p className="text-xs text-[#cec5bf]">Needs tighter conciseness and metric emphasis.</p>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-6 rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#4edea3]">Recommended For You</p>
              <h2 className="mt-2 text-3xl font-bold">Curated Roadmap</h2>
            </div>
            <Link href="/interview" className="text-sm font-bold text-[#cec5bf] transition hover:text-[#4edea3]">
              View all path
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-[#404945]/30 bg-[#201f1f] p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#4edea3]">Module 01</p>
              <h3 className="mt-2 text-2xl font-bold">Intro to Behavioral</h3>
              <p className="mt-2 text-sm text-[#cec5bf]">Practice workplace interaction and high-signal storytelling.</p>
            </article>
            <article className="rounded-xl border border-[#404945]/30 bg-[#201f1f] p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#ffb95f]">Mastery</p>
              <h3 className="mt-2 text-2xl font-bold">Master Your STAR</h3>
              <p className="mt-2 text-sm text-[#cec5bf]">Sharpen Situation, Task, Action, Result narratives with confidence.</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
