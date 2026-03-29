import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-stone-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_20%,rgba(245,158,11,0.2),transparent_40%),radial-gradient(circle_at_90%_5%,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_50%_120%,rgba(120,113,108,0.2),transparent_45%)]" />

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-8">
        <header className="flex items-center justify-between">
          <p className="rounded-full border border-stone-700 bg-stone-900/40 px-4 py-1 text-xs font-medium uppercase tracking-[0.22em] text-stone-300">
            ClearCue
          </p>
          <Link
            href="/login"
            className="rounded-lg border border-stone-600 bg-stone-900/60 px-4 py-2 text-sm font-semibold text-stone-100 transition hover:border-stone-400"
          >
            Login
          </Link>
        </header>

        <section className="mt-14 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="inline-flex items-center rounded-full border border-emerald-700/60 bg-emerald-950/40 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-emerald-200">
              AI Interview Practice Assistant
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Practice interviews tailored to your exact role
            </h1>
            <p className="mt-6 max-w-2xl text-base text-stone-300 sm:text-lg">
              Role-specific questions, immediate follow-ups, and honest feedback so every session feels like a real interview, not a generic quiz.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_8px_30px_rgba(245,158,11,0.25)] transition hover:-translate-y-0.5 hover:bg-amber-400"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-stone-600 bg-stone-900/50 px-6 py-3 text-sm font-semibold text-stone-100 transition hover:border-stone-400"
              >
                I already have an account
              </Link>
            </div>

            <div className="mt-8 grid max-w-2xl gap-3 text-sm text-stone-300 sm:grid-cols-3">
              <div className="rounded-xl border border-stone-800 bg-stone-900/40 px-4 py-3">
                <p className="text-xl font-semibold text-amber-300">1</p>
                <p className="mt-1">Pick your target role and interview type.</p>
              </div>
              <div className="rounded-xl border border-stone-800 bg-stone-900/40 px-4 py-3">
                <p className="text-xl font-semibold text-emerald-300">2</p>
                <p className="mt-1">Answer focused questions with follow-up pressure.</p>
              </div>
              <div className="rounded-xl border border-stone-800 bg-stone-900/40 px-4 py-3">
                <p className="text-xl font-semibold text-stone-200">3</p>
                <p className="mt-1">Review score trends and improve every session.</p>
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-stone-800 bg-stone-900/65 p-6 backdrop-blur sm:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400">Session Preview</p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-100">Pediatric Physiotherapist</h2>
            <p className="mt-2 text-sm text-stone-300">Medical interview • adaptive follow-up flow</p>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-stone-800 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-wide text-stone-400">Interviewer</p>
                <p className="mt-2 text-sm text-stone-200">
                  A 6-year-old with cerebral palsy is plateauing in gross motor milestones. What would your next 3 decisions be and why?
                </p>
              </div>
              <div className="rounded-xl border border-amber-700/50 bg-amber-950/40 p-4">
                <p className="text-xs uppercase tracking-wide text-amber-200">Feedback Snapshot</p>
                <p className="mt-2 text-sm text-amber-100">
                  Strong clinical reasoning. Slow down your pacing and make your prioritization framework explicit.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg border border-stone-700 bg-stone-900/70 px-2 py-3">
                  <p className="text-stone-400">Relevance</p>
                  <p className="mt-1 text-base font-semibold text-emerald-300">8/10</p>
                </div>
                <div className="rounded-lg border border-stone-700 bg-stone-900/70 px-2 py-3">
                  <p className="text-stone-400">Structure</p>
                  <p className="mt-1 text-base font-semibold text-amber-300">6/10</p>
                </div>
                <div className="rounded-lg border border-stone-700 bg-stone-900/70 px-2 py-3">
                  <p className="text-stone-400">Completeness</p>
                  <p className="mt-1 text-base font-semibold text-emerald-300">8/10</p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-16 rounded-2xl border border-stone-800 bg-stone-900/50 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-stone-100">Train with intent, not randomness</h3>
              <p className="mt-2 text-sm text-stone-300">
                Every question is grounded in your role, with interview-style follow-ups that mirror real pressure.
              </p>
            </div>
            <Link
              href="/register"
              className="w-full rounded-lg bg-emerald-700 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-600 sm:w-auto"
            >
              Start Your First Session
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
