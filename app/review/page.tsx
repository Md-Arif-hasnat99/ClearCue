"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProtectedTopNav from "@/components/ProtectedTopNav";
import type { GamificationSummary } from "@/lib/gamification";
import {
  INTERVIEW_REVIEW_STORAGE_KEY,
  type InterviewReviewSession,
} from "@/lib/interview-session";

import {
  type AnswerAnalysis,
  analyzeAnswer,
  average,
  getPerformanceLabel,
  getPriorityImprovements,
  getTopStrengths,
} from "@/lib/score-analyzer";

const PRACTICE_COMPLETION_PREFIX = "clearcue.practice-completed";

export default function ReviewPage() {
  const [session, setSession] = useState<InterviewReviewSession | null>(null);
  const [loadError, setLoadError] = useState("");
  const [practiceSummary, setPracticeSummary] = useState<GamificationSummary | null>(null);
  const [practiceError, setPracticeError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(INTERVIEW_REVIEW_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as InterviewReviewSession;

      if (!parsed?.items || !Array.isArray(parsed.items)) {
        setLoadError("Saved interview data is invalid. Please run a new interview.");
        return;
      }

      setSession(parsed);
    } catch (error) {
      console.error(error);
      setLoadError("Unable to load interview review data.");
    }
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    const completionMarkerKey = `${PRACTICE_COMPLETION_PREFIX}:${session.completedAt}`;

    try {
      const alreadyMarked = localStorage.getItem(completionMarkerKey);
      if (alreadyMarked === "1") {
        return;
      }
    } catch (error) {
      console.error(error);
    }

    let isMounted = true;

    const markPracticeComplete = async () => {
      try {
        const response = await fetch("/api/gamification/practice-complete", {
          method: "POST",
        });
        const data = (await response.json()) as
          | GamificationSummary
          | {
              error?: string;
            };

        if (!response.ok) {
          const apiError = "error" in data ? data.error : "Unable to mark practice";
          throw new Error(apiError || "Unable to mark practice");
        }

        if (isMounted) {
          setPracticeSummary(data as GamificationSummary);
          setPracticeError("");

          try {
            localStorage.setItem(completionMarkerKey, "1");
          } catch (storageError) {
            console.error(storageError);
          }
        }
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setPracticeError("Practice streak could not be updated right now.");
        }
      }
    };

    void markPracticeComplete();

    return () => {
      isMounted = false;
    };
  }, [session]);

  const analyses = useMemo(() => {
    if (!session) {
      return [];
    }

    return session.items.map(analyzeAnswer);
  }, [session]);

  const overallScore = useMemo(() => average(analyses.map((item) => item.score)), [analyses]);
  const topStrengths = useMemo(() => getTopStrengths(analyses), [analyses]);
  const priorityImprovements = useMemo(
    () => getPriorityImprovements(analyses),
    [analyses]
  );

  const avgWpm = useMemo(() => {
    const wpms = analyses.map((a) => a.pacingWpm).filter((v) => v > 0);
    if (!wpms.length) return 0;
    return Math.round(wpms.reduce((sum, v) => sum + v, 0) / wpms.length);
  }, [analyses]);

  const totalFillerWords = useMemo(
    () => analyses.reduce((sum, a) => sum + (a.fillerWordsCount || 0), 0),
    [analyses]
  );

  return (
    <main className="min-h-screen bg-[#131313] text-[#e5e2e1]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(78,222,163,0.1),transparent_35%),radial-gradient(circle_at_90%_4%,rgba(255,185,95,0.08),transparent_30%)]" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-28 pt-4 sm:px-8 lg:max-w-none lg:px-12 lg:pb-12 lg:pl-72 lg:pt-8">
        <ProtectedTopNav />

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="soft-grain rounded-xl border border-[#404945]/30 bg-[#201f1f] p-6 sm:p-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#ffb95f]">Session Analysis</p>
              <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">
                Interview Performance Review
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[#cec5bf] sm:text-base">
                Excellence through precision. Your feedback is grounded in clarity, structure, specificity, and impact.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-lg border border-[#404945] bg-[#2a2a2a] px-4 py-2.5 text-sm font-bold text-[#e5e2e1] transition hover:border-[#4edea3]"
              >
                Dashboard
              </Link>
              <Link
                href="/interview"
                className="auteur-gradient rounded-lg px-4 py-2.5 text-sm font-bold text-[#003824] transition hover:brightness-110"
              >
                Run New Interview
              </Link>
            </div>
          </div>

          <div className="glass-panel rounded-xl border border-[#404945]/30 p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a938f]">Global Score</p>
            <div className="mt-6 flex items-center gap-6">
              <div className="relative flex h-28 w-28 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                  {Array.from({ length: 32 }).map((_, i) => {
                    const angle = -135 + (i * 270) / 31;
                    const isFilled = i < (overallScore / 100) * 32;
                    return (
                      <line
                        key={i}
                        x1="50"
                        y1="4"
                        x2="50"
                        y2="16"
                        stroke={isFilled ? "#4edea3" : "#404945"}
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        transform={`rotate(${angle} 50 50)`}
                        className={isFilled ? "opacity-100" : "opacity-30"}
                      />
                    );
                  })}
                </svg>
                <span className="text-4xl font-extrabold text-[#4edea3] z-10">{overallScore}</span>
              </div>
              <div>
                <p className="text-xl font-bold text-[#e5e2e1]">{getPerformanceLabel(overallScore)}</p>
                <p className="mt-1 text-sm text-[#cec5bf]">Compared to your latest response set.</p>
                {practiceSummary ? (
                  <p className="mt-2 text-xs text-[#4edea3]">
                    Streak: {practiceSummary.currentStreak} day{practiceSummary.currentStreak === 1 ? "" : "s"}
                  </p>
                ) : null}
              </div>
            </div>
            {practiceSummary?.awardedBadges.length ? (
              <p className="mt-4 rounded-lg border border-[#00402a] bg-[#00402a]/25 px-3 py-2 text-xs text-[#6ffbbe]">
                New badge unlocked: {practiceSummary.awardedBadges.join(", ").replaceAll("_", " ")}
              </p>
            ) : null}
            {practiceError ? (
              <p className="mt-4 rounded-lg border border-[#93000a]/50 bg-[#93000a]/15 px-3 py-2 text-xs text-[#ffdad6]">
                {practiceError}
              </p>
            ) : null}
          </div>
        </section>

        {!session ? (
          <section className="mt-6 rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-6">
            <h2 className="text-xl font-semibold text-[#e5e2e1]">No Review Data Yet</h2>
            <p className="mt-2 text-[#cec5bf]">
              Complete at least one interview to generate a personalized review page.
            </p>
            {loadError ? <p className="mt-3 text-sm text-[#ffb4ab]">{loadError}</p> : null}
            <Link
              href="/interview"
              className="auteur-gradient mt-5 inline-flex rounded-lg px-4 py-2.5 text-sm font-bold text-[#003824]"
            >
              Start Interview
            </Link>
          </section>
        ) : (
          <>
<section className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <div className="rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-5 md:col-span-2 lg:col-span-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a938f]">Role Context</p>
                  <p className="mt-3 text-sm text-[#e5e2e1]">{session.role}</p>
                  <p className="mt-1 text-sm text-[#cec5bf]">
                    {session.industry} - {session.experience}
                  </p>
                </div>
                <div className="rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a938f]">Overall Score</p>
                  <p className="mt-3 text-4xl font-semibold text-[#4edea3]">{overallScore}/100</p>
                  <p className="mt-2 text-sm text-[#cec5bf]">{getPerformanceLabel(overallScore)}</p>
                </div>
                <div className="rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a938f]">Session Time</p>
                  <p className="mt-3 text-sm text-[#e5e2e1]">
                    {new Date(session.completedAt).toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-[#cec5bf]">Questions Reviewed: {analyses.length}</p>
                </div>
                <div className="rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a938f]">Average WPM</p>
                  <p className={`mt-3 text-4xl font-semibold ${avgWpm >= 110 && avgWpm <= 160 ? 'text-[#4edea3]' : 'text-[#ffb95f]'}`}>
                    {avgWpm > 0 ? avgWpm : '--'}
                  </p>
                  <p className="mt-2 text-sm text-[#cec5bf] whitespace-nowrap">
                    Target: 130 - 150
                  </p>
                </div>
                <div className="rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a938f]">Filler Words</p>
                  <p className={`mt-3 text-4xl font-semibold ${totalFillerWords < 4 ? 'text-[#4edea3]' : totalFillerWords < 10 ? 'text-[#ffb95f]' : 'text-[#ffb4ab]'}`}>
                    {totalFillerWords}
                  </p>
                  <p className="mt-2 text-sm text-[#cec5bf] whitespace-nowrap">
                    ums, ahs, likes
                  </p>
              </div>
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-[#00402a] bg-[#00402a]/25 p-5">
                <h2 className="text-lg font-semibold text-[#6ffbbe]">What You Did Well</h2>
                <ul className="mt-3 space-y-2 text-sm text-[#d7fff0]">
                  {topStrengths.length ? (
                    topStrengths.map((item) => <li key={item}>- {item}</li>)
                  ) : (
                    <li>- Keep answering to unlock strengths.</li>
                  )}
                </ul>
              </div>

              <div className="rounded-xl border border-[#503000] bg-[#503000]/25 p-5">
                <h2 className="text-lg font-semibold text-[#ffddb8]">What To Improve Next</h2>
                <ul className="mt-3 space-y-2 text-sm text-[#ffddb8]">
                  {priorityImprovements.length ? (
                    priorityImprovements.map((item) => <li key={item}>- {item}</li>)
                  ) : (
                    <li>- Great consistency. Keep refining clarity and brevity.</li>
                  )}
                </ul>
              </div>
            </section>

            <section className="mt-6 space-y-4">
              {analyses.map((analysis, index) => (
                <article
                  key={`${analysis.id}-${index}`}
                  className="rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a938f]">
                        Question {index + 1} - {analysis.type}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-[#e5e2e1]">
                        {analysis.question}
                      </h3>
                    </div>
                    <div className="rounded-lg border border-[#404945] bg-[#201f1f] px-3 py-2 text-right">
                      <p className="text-xs text-[#8a938f]">Score</p>
                      <p className="text-xl font-semibold text-[#4edea3]">{analysis.score}/100</p>
                    </div>
                  </div>

                  <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[#8a938f]">Your Answer</p>
                  <p className="mt-2 whitespace-pre-wrap rounded-lg border border-[#404945]/30 bg-[#201f1f] p-3 text-sm text-[#e5e2e1]">
                    {analysis.answer || "No answer captured."}
                  </p>

                    <div className="mt-3 flex items-center gap-4 text-xs">
                      <p className="text-[#8a938f]">Word count: <span className="font-semibold text-[#e5e2e1]">{analysis.wordCount}</span></p>
                      <p className="text-[#8a938f]">Speaking pacing: <span className="font-semibold text-[#e5e2e1]">{analysis.pacingWpm > 0 ? `${analysis.pacingWpm} WPM` : '--'}</span></p>
                      <p className="text-[#8a938f]">Filler words: <span className="font-semibold text-[#e5e2e1]">{analysis.fillerWordsCount}</span></p>
                    </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-[#00402a] bg-[#00402a]/25 p-3">
                      <p className="text-sm font-semibold text-[#6ffbbe]">Strengths</p>
                      <ul className="mt-2 space-y-1 text-sm text-[#d7fff0]">
                        {analysis.strengths.slice(0, 3).map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                        {!analysis.strengths.length ? <li>- No strong signal yet.</li> : null}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-[#503000] bg-[#503000]/25 p-3">
                      <p className="text-sm font-semibold text-[#ffddb8]">Improve</p>
                      <ul className="mt-2 space-y-1 text-sm text-[#ffddb8]">
                        {analysis.improvements.slice(0, 3).map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                        {!analysis.improvements.length ? <li>- Keep current approach.</li> : null}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
