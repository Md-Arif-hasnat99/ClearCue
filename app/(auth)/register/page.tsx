"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type RegisterErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): RegisterErrors => {
    const nextErrors: RegisterErrors = {};

    if (!name.trim()) nextErrors.name = "Name is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    if (!password) nextErrors.password = "Password is required.";
    if (password.length > 0 && password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (!confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
    if (password && confirmPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setErrors({ form: data?.error ?? "Registration failed. Please try again." });
      return;
    }

    router.push("/login");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-stone-100 px-4 py-10 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_5%_5%,rgba(245,158,11,0.2),transparent_34%),radial-gradient(circle_at_95%_8%,rgba(16,185,129,0.16),transparent_40%)]" />

      <div className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_20px_60px_rgba(28,25,23,0.16)] lg:grid-cols-2">
        <section className="hidden bg-slate-900 p-8 text-stone-100 lg:block">
          <p className="text-xs uppercase tracking-[0.22em] text-stone-300">ClearCue</p>
          <h1 className="mt-5 text-3xl font-semibold leading-tight">Create your practice workspace</h1>
          <p className="mt-4 text-sm text-stone-300">
            Start role-specific interview drills and build confidence with detailed, actionable feedback.
          </p>

          <div className="mt-8 space-y-3 text-sm">
            <div className="rounded-xl border border-emerald-800/70 bg-emerald-950/35 p-4 text-emerald-100">
              1. Choose your role and interview style.
            </div>
            <div className="rounded-xl border border-amber-800/70 bg-amber-950/30 p-4 text-amber-100">
              2. Practice with adaptive follow-up questions.
            </div>
            <div className="rounded-xl border border-stone-700 bg-stone-900/50 p-4 text-stone-200">
              3. Track your score progression over sessions.
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Create Account</p>
            <Link className="text-sm font-medium text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline" href="/">
              Back Home
            </Link>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900">Start your first session</h2>
          <p className="mt-2 text-sm text-slate-600">Set up your account to begin focused interview preparation.</p>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
              />
              {errors.name ? <p className="mt-1 text-sm text-rose-700">{errors.name}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
              />
              {errors.email ? <p className="mt-1 text-sm text-rose-700">{errors.email}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
              />
              {errors.password ? <p className="mt-1 text-sm text-rose-700">{errors.password}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
              />
              {errors.confirmPassword ? (
                <p className="mt-1 text-sm text-rose-700">{errors.confirmPassword}</p>
              ) : null}
            </div>

            {errors.form ? <p className="text-sm text-rose-700">{errors.form}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Already have an account?{" "}
            <Link className="font-medium text-emerald-700 hover:text-emerald-800" href="/login">
              Login
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
