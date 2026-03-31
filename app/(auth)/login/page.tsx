"use client";

import Image from "next/image";
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

    if (!result) {
      setError("Login failed. Please try again.");
      return;
    }

    if (result.error) {
      if (result.error === "CredentialsSignin") {
        setError("Invalid email or password.");
      } else {
        setError(
          "Login is temporarily unavailable. Check database connection and try again."
        );
      }
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#131313] text-[#e5e2e1]">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="soft-grain relative hidden overflow-hidden lg:block">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7Rm3VG8k1uxWlat9jxGZmcRk0WlaEgRGiKDq3JVo4rYP4bRtIG9ciNSoSLO7o6vNJ-S7JFhLGXSbGN-N3V6JArZPk3zv7yZF1qEyUdRGh5FFQa8fP2b0jmd9kGGEhmtu4lvKyA8kmNeAqjNdah6s2XdbgLBHnZjBTjDdnNTuyfMztq_42qpl23scAmjCBq6ByrtEGNiqd5ZmK27zdP4crxIi5BXoO5BccshaUA_GeAt3JR5O_mHC1OQnVws4GDE9jENI3AI-QYKnw"
            alt="studio"
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="absolute inset-0 h-full w-full object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#131313]/50 to-[#131313]" />

          <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-20">
            <div>
              <p className="text-3xl font-bold tracking-tight text-[#4edea3]">ClearCue</p>
            </div>
            <div className="max-w-xl space-y-6">
              <p className="inline-flex rounded-full border border-[#ffb95f]/35 bg-[#503000]/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffb95f]">
                Premium Coaching Interface
              </p>
              <h1 className="text-5xl font-extrabold leading-tight text-[#e5e2e1] xl:text-7xl">
                Master the <span className="italic text-[#4edea3]">Art</span> of the Interview
              </h1>
              <p className="text-lg text-[#cec5bf]">
                Enter your studio and continue role-specific interview practice with measurable feedback.
              </p>
            </div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8a938f]">Handcrafted for peak performance</p>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center bg-[#131313] p-6 sm:p-10">
          <div className="w-full max-w-md rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-7 sm:p-9">
            <div className="mb-8 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8a938f]">Welcome Back</p>
              <Link href="/" className="text-xs font-semibold uppercase tracking-[0.12em] text-[#cec5bf] hover:text-[#4edea3]">
                Home
              </Link>
            </div>

            <h2 className="text-3xl font-bold text-[#e5e2e1]">Log In</h2>
            <p className="mt-2 text-sm text-[#cec5bf]/80">Access your interview studio and continue practice.</p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a938f]" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full border-0 border-b border-[#404945] bg-transparent px-0 py-3 text-[#e5e2e1] placeholder:text-[#8a938f] focus:border-[#4edea3] focus:ring-0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a938f]" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full border-0 border-b border-[#404945] bg-transparent px-0 py-3 text-[#e5e2e1] placeholder:text-[#8a938f] focus:border-[#4edea3] focus:ring-0"
                />
              </div>

              {error ? <p className="text-sm text-[#ffb4ab]">{error}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="auteur-gradient w-full rounded-lg px-5 py-4 text-sm font-bold tracking-wide text-[#003824] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Login to ClearCue"}
              </button>
            </form>

            <p className="mt-6 text-sm text-[#cec5bf]/80">
              Need an account?{" "}
              <Link className="font-bold text-[#4edea3] hover:text-[#6ffbbe]" href="/register">
                Register
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
