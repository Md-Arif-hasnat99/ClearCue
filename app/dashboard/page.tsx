import Link from "next/link";

import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-4xl px-4 py-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-3 text-slate-600">
          Signed in as <span className="font-medium text-slate-900">{session?.user.email}</span>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Your interview analytics and history will appear here as we complete later phases.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/interview"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Start Interview
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Back Home
          </Link>
        </div>
      </section>
    </main>
  );
}
