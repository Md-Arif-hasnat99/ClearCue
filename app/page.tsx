import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-[#131313] text-[#e5e2e1]">
      <nav className="fixed top-0 z-40 w-full border-b border-[#404945]/30 bg-[#131313]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <p className="text-2xl font-bold tracking-tight text-[#4edea3]">ClearCue</p>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-[#404945] bg-[#1c1b1b] px-4 py-2 text-sm font-semibold text-[#cec5bf] transition hover:border-[#4edea3] hover:text-[#4edea3]"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="auteur-gradient rounded-lg px-4 py-2 text-sm font-semibold text-[#003824] transition hover:brightness-110"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative flex min-h-screen items-center overflow-hidden pt-24">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEGda05Nhw6ej488TjZVNLXfYHbuo5bDg3H8oLrtVAijt0wQ9jV399V5FI2R2unjT4maSpBL-iuUmqGfhSlnR3vVlOpE9-W4WSozJtIshvYx-iwpE6Tq5Bf0qV1B0IYgsoNBaMq0p_AVjitx6yGb3467GTH31ERUQUdWTqXtuxdypXAnvPsDCmM5TH3NuxExSMClQNRdrA_A-xFswi_N78OUNf89RxJkuSgkmh4ir1_vB24b6YOdsvGmoVzmfPt0yBRl5nzDCMJGXS"
          alt="studio"
          fill
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/75 to-[#131313]/40" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-[#ffb95f]/40 bg-[#503000]/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#ffb95f]">
              The Digital Auteur Experience
            </p>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
              Master the Art of the <span className="italic text-[#4edea3]">Interview</span>
            </h1>
            <p className="max-w-xl text-base text-[#cec5bf] sm:text-lg">
              Step into a cinematic training environment designed for elite career growth, voice confidence, and role-specific precision.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/register"
                className="auteur-gradient rounded-lg px-6 py-3 text-sm font-bold text-[#003824]"
              >
                Register Now
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-[#404945] bg-[#2a2a2a]/60 px-6 py-3 text-sm font-bold text-[#e5e2e1]"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="soft-grain rounded-xl border border-[#404945]/30 bg-[#201f1f]/80 p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[#cec5bf]/70">Session Preview</p>
            <h2 className="mt-3 text-2xl font-bold text-[#4edea3]">Studio Capabilities</h2>
            <div className="mt-5 space-y-3 text-sm text-[#cec5bf]">
              <div className="rounded-lg border border-[#404945]/40 bg-[#1c1b1b] p-4">
                Real-time vocal analytics monitor your cadence, tone, and confidence.
              </div>
              <div className="rounded-lg border border-[#404945]/40 bg-[#1c1b1b] p-4">
                Adaptive role-based questions with high-pressure follow-up logic.
              </div>
              <div className="rounded-lg border border-[#404945]/40 bg-[#1c1b1b] p-4">
                Score tracking across clarity, structure, specificity, and impact.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#404945]/20 bg-[#1c1b1b] py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-8 md:grid-cols-3">
          <article className="soft-grain rounded-xl border border-[#404945]/40 bg-[#201f1f] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4edea3]">01 Vocal Architecture</p>
            <p className="mt-3 text-sm text-[#cec5bf]">Develop a unique voice signature, pacing control, and executive presence.</p>
          </article>
          <article className="soft-grain rounded-xl border border-[#404945]/40 bg-[#201f1f] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4edea3]">02 Narrative Arc</p>
            <p className="mt-3 text-sm text-[#cec5bf]">Turn your experience into compelling stories with high recall impact.</p>
          </article>
          <article className="soft-grain rounded-xl border border-[#404945]/40 bg-[#201f1f] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4edea3]">03 Stress Test</p>
            <p className="mt-3 text-sm text-[#cec5bf]">Train with pressure pivots and difficult follow-ups before the real interview.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
