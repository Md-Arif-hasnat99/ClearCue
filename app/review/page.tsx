"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProtectedTopNav from "@/components/ProtectedTopNav";
import {
  INTERVIEW_REVIEW_STORAGE_KEY,
  type InterviewReviewSession,
} from "@/lib/interview-session";

type AnswerAnalysis = {
  id: number;
  question: string;
  type: string;
  answer: string;
  wordCount: number;
  score: number;
  strengths: string[];
  improvements: string[];
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const average = (values: number[]) => {
  if (!values.length) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const analyzeAnswer = (
  item: InterviewReviewSession["items"][number]
): AnswerAnalysis => {
  const answer = item.answer.trim();
  const wordCount = answer ? answer.split(/\s+/).filter(Boolean).length : 0;

  const hasStructure = /\b(first|second|third|finally|step|approach|framework)\b/i.test(
    answer
  );
  const hasExample = /\b(for example|for instance|e\.g\.|example)\b/i.test(answer);
  const hasMetric = /\b\d+(\.\d+)?(%|x|k|m|ms|hour|hours|day|days|week|weeks|month|months|year|years)?\b/i.test(
    answer
  );
  const hasImpact =
    /\b(result|impact|improve|improved|increase|increased|reduce|reduced|achieved|outcome|led to)\b/i.test(
      answer
    );
  const hasOwnership = /\b(i|my|me)\b/i.test(answer);

  const contentScore = clamp(Math.round((wordCount / 80) * 100), 0, 100);
  const structureScore = clamp(
    (hasStructure ? 45 : 10) + (hasOwnership ? 25 : 10) + (wordCount >= 30 ? 30 : 5),
    0,
    100
  );
  const specificityScore = clamp(
    (hasExample ? 40 : 10) + (hasMetric ? 40 : 5) + (wordCount >= 40 ? 20 : 10),
    0,
    100
  );
  const impactScore = clamp((hasImpact ? 60 : 15) + (hasMetric ? 25 : 10) + 15, 0, 100);

  let score = Math.round((contentScore + structureScore + specificityScore + impactScore) / 4);

  if (wordCount > 220) {
    score = Math.max(0, score - 12);
  }

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (wordCount >= 45) {
    strengths.push("Good depth in explanation");
  } else {
    improvements.push("Expand your answer with more reasoning and context");
  }

  if (hasStructure) {
    strengths.push("Clear structure is visible");
  } else {
    improvements.push("Use a framework: first, second, finally");
  }

  if (hasExample) {
    strengths.push("Concrete example included");
  } else {
    improvements.push("Include one specific example from your experience");
  }

  if (hasMetric) {
    strengths.push("Includes measurable evidence");
  } else {
    improvements.push("Add metrics or outcomes to make impact believable");
  }

  if (hasImpact) {
    strengths.push("Explains business or project impact");
  } else {
    improvements.push("End with the result or impact of your actions");
  }

  if (!answer) {
    improvements.length = 0;
    improvements.push("No answer captured. Record or type your response to get useful feedback.");
    score = 0;
  }

  return {
    id: item.id,
    question: item.question,
    type: item.type,
    answer,
    wordCount,
    score,
    strengths,
    improvements,
  };
};

const getPriorityImprovements = (analyses: AnswerAnalysis[]) => {
  const counter = new Map<string, number>();

  for (const analysis of analyses) {
    for (const tip of analysis.improvements) {
      counter.set(tip, (counter.get(tip) ?? 0) + 1);
    }
  }

  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tip]) => tip);
};

const getTopStrengths = (analyses: AnswerAnalysis[]) => {
  const counter = new Map<string, number>();

  for (const analysis of analyses) {
    for (const note of analysis.strengths) {
      counter.set(note, (counter.get(note) ?? 0) + 1);
    }
  }

  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([note]) => note);
};

const getPerformanceLabel = (score: number) => {
  if (score >= 85) {
    return "Interview ready";
  }

  if (score >= 70) {
    return "Strong baseline";
  }

  if (score >= 55) {
    return "Promising, needs tightening";
  }

  return "Needs focused practice";
};

export default function ReviewPage() {
  const [session, setSession] = useState<InterviewReviewSession | null>(null);
  const [loadError, setLoadError] = useState("");

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

  return (
    <main className="min-h-screen bg-[#131313] text-[#e5e2e1]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(78,222,163,0.1),transparent_35%),radial-gradient(circle_at_90%_4%,rgba(255,185,95,0.08),transparent_30%)]" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-28 pt-4 sm:px-8 lg:ml-64 lg:max-w-none lg:px-12 lg:pb-12 lg:pt-8">
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
            <div className="mt-4 flex items-center gap-5">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-8 border-[#4edea3]/25">
                <span className="text-4xl font-extrabold text-[#4edea3]">{overallScore}</span>
              </div>
              <div>
                <p className="text-xl font-bold text-[#e5e2e1]">{getPerformanceLabel(overallScore)}</p>
                <p className="mt-1 text-sm text-[#cec5bf]">Compared to your latest response set.</p>
              </div>
            </div>
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
            <section className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-5 md:col-span-2">
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

                  <p className="mt-3 text-xs text-[#8a938f]">Word count: {analysis.wordCount}</p>

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
