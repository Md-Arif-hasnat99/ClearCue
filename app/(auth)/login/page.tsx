"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-stone-100 px-4 py-10 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_15%,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_95%_0%,rgba(245,158,11,0.2),transparent_40%)]" />

      <div className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_20px_60px_rgba(28,25,23,0.16)] lg:grid-cols-2">
        <section className="hidden bg-slate-900 p-8 text-stone-100 lg:block">
          <p className="text-xs uppercase tracking-[0.22em] text-stone-300">ClearCue</p>
          <h1 className="mt-5 text-3xl font-semibold leading-tight">Welcome back to deliberate interview practice</h1>
          <p className="mt-4 text-sm text-stone-300">
            Pick up where you left off, continue your role-specific sessions, and track measurable improvement.
          </p>

          <div className="mt-8 space-y-3">
            <div className="rounded-xl border border-stone-700 bg-stone-900/50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-400">Focused prompts</p>
              <p className="mt-1 text-sm text-stone-200">Questions adapt to your job target and interview style.</p>
            </div>
            <div className="rounded-xl border border-stone-700 bg-stone-900/50 p-4">
              <p className="text-xs uppercase tracking-wide text-stone-400">Progress clarity</p>
              <p className="mt-1 text-sm text-stone-200">See your score trend and confidence level over time.</p>
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Sign In</p>
            <Link className="text-sm font-medium text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline" href="/">
              Back Home
            </Link>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900">Log in to continue</h2>
          <p className="mt-2 text-sm text-slate-600">Continue your practice sessions and improve interview confidence.</p>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {error ? <p className="text-sm text-rose-700">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Need an account?{" "}
            <Link className="font-medium text-amber-700 hover:text-amber-800" href="/register">
              Register
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
