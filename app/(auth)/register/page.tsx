"use client";

import Image from "next/image";
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
    <main className="min-h-screen bg-[#131313] text-[#e5e2e1]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="soft-grain relative hidden overflow-hidden lg:block">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2XvPf5I7eBJkegrC0LG-aR99LVio1kE-s-QtjLsss_hMWDOzBdPoyvxVtPEqutliNjIYbp2sA_Q2g3KVS-MIENN3L_jVP4TrNYOKzWDEaa5iP6PZ8-m0udXU8PsYOLlHAdXpZX_Pdy8s00vSHO377PmhOQWUUcashxoGe2ogQ4yu1Gy6VMVDq5x00PaPq7NMRfqkzilwIDAYg8WAGjELZ0fX3S2jA99Oi-DhHH79x7lKwLguLmeppFkslhEMKYhMgn28bDctInViT"
            alt="spotlight microphone"
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/40 to-transparent" />

          <div className="relative z-10 flex h-full flex-col justify-end p-12 xl:p-20">
            <p className="mb-8 text-2xl font-bold tracking-tight text-[#4edea3]">ClearCue</p>
            <div className="max-w-lg space-y-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4edea3]">Master Your Voice</p>
              <h1 className="text-5xl font-extrabold leading-tight xl:text-7xl">
                Unlock Your <span className="italic text-[#4edea3]">Potential</span>
              </h1>
              <p className="text-lg text-[#cec5bf]">Step into the spotlight with AI-driven interview coaching designed for the digital auteur.</p>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center bg-[#1c1b1b] p-6 sm:p-10">
          <div className="w-full max-w-md rounded-xl border border-[#404945]/30 bg-[#201f1f] p-7 sm:p-9">
            <div className="mb-8 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8a938f]">Create Your Studio</p>
              <Link href="/" className="text-xs font-semibold uppercase tracking-[0.1em] text-[#cec5bf] hover:text-[#4edea3]">
                Home
              </Link>
            </div>

            <h2 className="text-3xl font-bold text-[#e5e2e1]">Create Account</h2>
            <p className="mt-2 text-sm text-[#cec5bf]/80">Join professionals mastering their pitch with focused sessions.</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a938f]" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full border-0 border-b border-[#404945] bg-transparent px-0 py-3 text-[#e5e2e1] placeholder:text-[#8a938f] focus:border-[#4edea3] focus:ring-0"
                />
                {errors.name ? <p className="text-xs text-[#ffb4ab]">{errors.name}</p> : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a938f]" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full border-0 border-b border-[#404945] bg-transparent px-0 py-3 text-[#e5e2e1] placeholder:text-[#8a938f] focus:border-[#4edea3] focus:ring-0"
                />
                {errors.email ? <p className="text-xs text-[#ffb4ab]">{errors.email}</p> : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a938f]" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full border-0 border-b border-[#404945] bg-transparent px-0 py-3 text-[#e5e2e1] placeholder:text-[#8a938f] focus:border-[#4edea3] focus:ring-0"
                />
                {errors.password ? <p className="text-xs text-[#ffb4ab]">{errors.password}</p> : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a938f]" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full border-0 border-b border-[#404945] bg-transparent px-0 py-3 text-[#e5e2e1] placeholder:text-[#8a938f] focus:border-[#4edea3] focus:ring-0"
                />
                {errors.confirmPassword ? <p className="text-xs text-[#ffb4ab]">{errors.confirmPassword}</p> : null}
              </div>

              {errors.form ? <p className="text-sm text-[#ffb4ab]">{errors.form}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="auteur-gradient mt-2 w-full rounded-lg px-5 py-4 text-sm font-bold tracking-wide text-[#003824] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-sm text-[#cec5bf]/80">
              Already have an account?{" "}
              <Link className="font-bold text-[#4edea3] hover:text-[#6ffbbe]" href="/login">
                Log In
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
