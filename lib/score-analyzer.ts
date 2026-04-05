import type { InterviewReviewItem } from "@/lib/interview-session";

export type AnswerAnalysis = {
  id: number;
  question: string;
  type: string;
  answer: string;
  wordCount: number;
  fillerWordsCount: number;
  pacingWpm: number;
  durationSeconds?: number;
  score: number;
  strengths: string[];
  improvements: string[];
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const average = (values: number[]) => {
  if (!values.length) {
    return 0;
  }
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

export const analyzeAnswer = (
  item: InterviewReviewItem
): AnswerAnalysis => {
  const answer = (item.answer ?? "").trim();
  const wordCount = answer ? answer.split(/\s+/).filter(Boolean).length : 0;

  const durationSeconds = item.durationSeconds || 0;
  const pacingWpm = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;
  const fillerMatch = answer.match(/\b(um|uh|ah|like|you know|literally|basically|actually|right|i mean)\b/gi);
  const fillerWordsCount = fillerMatch ? fillerMatch.length : 0;

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

  if (fillerWordsCount > 3) {
    improvements.push(`High filler word usage detected (${fillerWordsCount} words)`);
    score = Math.max(0, score - (fillerWordsCount * 2));
  } else if (durationSeconds > 0) {
    strengths.push("Great control over filler words");
  }

  if (pacingWpm > 0) {
    if (pacingWpm > 160) {
      improvements.push(`Speaking too fast (${pacingWpm} WPM). Aim for 130-150.`);
      score = Math.max(0, score - 5);
    } else if (pacingWpm < 110) {
      improvements.push(`Pacing is too slow (${pacingWpm} WPM). Aim for 130-150.`);
      score = Math.max(0, score - 5);
    } else {
      strengths.push(`Excellent conversational pacing (${pacingWpm} WPM)`);
    }
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
    durationSeconds,
    fillerWordsCount,
    pacingWpm,
    score,
    strengths,
    improvements,
  };
};

export const getPriorityImprovements = (analyses: AnswerAnalysis[]) => {
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

export const getTopStrengths = (analyses: AnswerAnalysis[]) => {
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

export const getPerformanceLabel = (score: number) => {
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

export const computeSessionScores = (items: InterviewReviewItem[]) => {
  const analyses = items.map(analyzeAnswer);
  
  const hasExampleCount = items.filter(item => /\b(for example|for instance|e\.g\.|example)\b/i.test(item.answer)).length;
  const hasMetricCount = items.filter(item => /\b\d+(\.\d+)?(%|x|k|m|ms|hour|hours|day|days|week|weeks|month|months|year|years)?\b/i.test(item.answer)).length;
  const hasImpactCount = items.filter(item => /\b(result|impact|improve|improved|increase|increased|reduce|reduced|achieved|outcome|led to)\b/i.test(item.answer)).length;
  const hasStructureCount = items.filter(item => /\b(first|second|third|finally|step|approach|framework)\b/i.test(item.answer)).length;
  
  // A simplistic mapping to fit the 5 dimensions 
  const clarity = clamp(average(analyses.map(a => a.wordCount >= 40 && a.wordCount <= 220 ? 90 : (a.wordCount < 40 ? a.wordCount * 2 : 50))), 0, 100);
  const confidence = clamp(average(analyses.map(a => a.wordCount > 20 ? 80 : 40)), 0, 100);
  const structure = clamp(Math.round((hasStructureCount / Math.max(items.length, 1)) * 100) + 20, 0, 100);
  const specificity = clamp(Math.round((hasExampleCount / Math.max(items.length, 1)) * 100) + Math.round((hasMetricCount / Math.max(items.length, 1)) * 50), 0, 100);
  const impact = clamp(Math.round((hasImpactCount / Math.max(items.length, 1)) * 100) + 20, 0, 100);
  
  const overallScore = average(analyses.map((item) => item.score));

  return {
    clarity,
    confidence,
    structure,
    specificity,
    impact,
    overallScore
  };
};