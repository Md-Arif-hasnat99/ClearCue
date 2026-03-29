"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ProtectedTopNav from "@/components/ProtectedTopNav";
import {
  INTERVIEW_REVIEW_STORAGE_KEY,
  type InterviewQuestion,
  type InterviewReviewSession,
} from "@/lib/interview-session";

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionResultListLike = {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
};

type SpeechRecognitionEventLike = Event & {
  results: SpeechRecognitionResultListLike;
};

type SpeechRecognitionErrorEventLike = Event & {
  error?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const getSpeechRecognitionCtor = (): SpeechRecognitionConstructor | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
};

export default function InterviewSetup() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [speechSynthesisSupported, setSpeechSynthesisSupported] =
    useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] =
    useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [formData, setFormData] = useState({
    jobTitle: "",
    industry: "",
    experience: "Entry Level",
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setSpeechSynthesisSupported("speechSynthesis" in window);
    setSpeechRecognitionSupported(Boolean(getSpeechRecognitionCtor()));

    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setIsSpeaking(false);
    setIsInterviewStarted(false);
    setIsInterviewCompleted(false);
    setCurrentQuestionIndex(0);
    setAnswers(questions.map(() => ""));

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [questions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details
            ? `${data.error}: ${data.details}`
            : data.error || "Failed to generate questions"
        );
      }

      const generatedQuestions = Array.isArray(data.questions)
        ? (data.questions as InterviewQuestion[])
        : [];

      setQuestions(generatedQuestions);
    } catch (error) {
      console.error(error);
      setQuestions([]);
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const speakQuestion = (index: number) => {
    const selectedQuestion = questions[index];

    if (!selectedQuestion) {
      return;
    }

    if (!speechSynthesisSupported || typeof window === "undefined") {
      setErrorMessage(
        "Text-to-speech is not supported in this browser. Please read the question on screen."
      );
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      `Question ${index + 1}. ${selectedQuestion.question}`
    );

    utterance.lang = "en-US";
    utterance.rate = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setErrorMessage(
        "Unable to play the voice question. Check your browser audio settings."
      );
    };

    window.speechSynthesis.speak(utterance);
  };

  const startInterview = () => {
    if (!questions.length) {
      return;
    }

    setErrorMessage("");
    setIsInterviewCompleted(false);
    setIsInterviewStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers(questions.map(() => ""));
    speakQuestion(0);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const startListening = () => {
    if (!speechRecognitionSupported) {
      setErrorMessage(
        "Speech recognition is not supported in this browser. Please type your answer manually."
      );
      return;
    }

    if (!questions[currentQuestionIndex]) {
      return;
    }

    if (isSpeaking && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const RecognitionCtor = getSpeechRecognitionCtor();

    if (!RecognitionCtor) {
      setErrorMessage(
        "Speech recognition is not available. Please type your answer manually."
      );
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new RecognitionCtor();
    }

    const recognition = recognitionRef.current;
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcriptChunks: string[] = [];

      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.length > 0 && result[0]?.transcript) {
          transcriptChunks.push(result[0].transcript.trim());
        }
      }

      const combinedTranscript = transcriptChunks.join(" ").trim();

      setAnswers((prev) => {
        const next = [...prev];
        next[currentQuestionIndex] = combinedTranscript;
        return next;
      });
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      setErrorMessage(
        event.error
          ? `Microphone error: ${event.error}. Check mic permission and try again.`
          : "Microphone error. Check mic permission and try again."
      );
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      setErrorMessage("");
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error(error);
      setIsListening(false);
      setErrorMessage("Unable to start microphone listening.");
    }
  };

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = value;
      return next;
    });
  };

  const moveToNextQuestion = () => {
    if (!questions.length) {
      return;
    }

    stopListening();

    if (currentQuestionIndex >= questions.length - 1) {
      saveInterviewSession();
      setIsInterviewCompleted(true);
      return;
    }

    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setTimeout(() => {
      speakQuestion(nextIndex);
    }, 100);
  };

  const saveInterviewSession = () => {
    if (typeof window === "undefined") {
      return;
    }

    const payload: InterviewReviewSession = {
      role: formData.jobTitle,
      industry: formData.industry,
      experience: formData.experience,
      completedAt: new Date().toISOString(),
      items: questions.map((question, index) => ({
        id: question.id,
        question: question.question,
        type: question.type,
        answer: answers[index] ?? "",
      })),
    };

    try {
      localStorage.setItem(INTERVIEW_REVIEW_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error(error);
      setErrorMessage("Interview finished, but unable to save data for review page.");
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const hasAnyAnswers = answers.some((answer) => Boolean(answer.trim()));

  return (
    <main className="min-h-screen bg-[#131313] text-[#e5e2e1]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(78,222,163,0.1),transparent_35%),radial-gradient(circle_at_85%_3%,rgba(255,185,95,0.1),transparent_30%)]" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-28 pt-4 sm:px-8 lg:ml-64 lg:max-w-none lg:px-12 lg:pb-12 lg:pt-8">
        <ProtectedTopNav />

        <section className="mt-6 rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-6 sm:p-8">
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#ffb95f]">Session Setup</p>
            <h1 className="mt-2 text-4xl font-extrabold">Configure Your Interview</h1>
            <p className="mt-2 text-sm text-[#cec5bf] sm:text-base">
              Provide role context and start a guided one-by-one voice interview.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="jobTitle" className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a938f]">
                Target Job Title
              </label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                required
                placeholder="Frontend Developer"
                value={formData.jobTitle}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#404945] bg-[#201f1f] px-4 py-3 text-[#e5e2e1] placeholder:text-[#8a938f] focus:border-[#4edea3] focus:ring-0"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="industry" className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a938f]">
                Industry
              </label>
              <input
                type="text"
                id="industry"
                name="industry"
                required
                placeholder="Technology"
                value={formData.industry}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#404945] bg-[#201f1f] px-4 py-3 text-[#e5e2e1] placeholder:text-[#8a938f] focus:border-[#4edea3] focus:ring-0"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="experience" className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a938f]">
                Experience Level
              </label>
              <select
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#404945] bg-[#201f1f] px-4 py-3 text-[#e5e2e1] focus:border-[#4edea3] focus:ring-0"
              >
                <option value="Entry Level">Entry Level (0-2 years)</option>
                <option value="Mid Level">Mid Level (3-5 years)</option>
                <option value="Senior">Senior (5-8 years)</option>
                <option value="Lead/Director">Lead/Director (8+ years)</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="auteur-gradient w-full rounded-lg px-5 py-3 text-sm font-bold text-[#003824] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Preparing Session..." : "Start Mock Interview"}
              </button>
            </div>

            {errorMessage ? (
              <p className="md:col-span-3 rounded-lg border border-[#93000a] bg-[#93000a]/20 px-4 py-2 text-sm text-[#ffdad6]">
                {errorMessage}
              </p>
            ) : null}
          </form>
        </section>

        {questions.length > 0 ? (
          <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-xl border border-[#404945]/30 bg-[#201f1f] p-6 sm:p-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold">Voice Interview</h2>
                  <p className="mt-1 text-sm text-[#cec5bf]">
                    Role: {formData.jobTitle} | Industry: {formData.industry} | Level: {formData.experience}
                  </p>
                </div>
                {isInterviewStarted ? (
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a938f]">Progress</p>
                    <p className="text-sm font-bold text-[#4edea3]">
                      {currentQuestionIndex + 1} / {questions.length}
                    </p>
                  </div>
                ) : null}
              </div>

              {isInterviewStarted ? (
                <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-[#0e0e0e]">
                  <div
                    className="auteur-gradient h-full rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              ) : null}

              {!isInterviewStarted ? (
                <div className="space-y-4 rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-5">
                  <p className="text-sm text-[#cec5bf]">
                    Start a guided voice round. ClearCue reads each question aloud and captures your answer transcript.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={startInterview}
                      className="auteur-gradient rounded-lg px-5 py-3 text-sm font-bold text-[#003824]"
                    >
                      Begin Voice Interview
                    </button>
                  </div>
                  {!speechSynthesisSupported ? (
                    <p className="text-xs text-[#ffb95f]">Text-to-speech not supported. Questions stay visible on screen.</p>
                  ) : null}
                  {!speechRecognitionSupported ? (
                    <p className="text-xs text-[#ffb95f]">Speech recognition not supported. You can still type manually.</p>
                  ) : null}
                </div>
              ) : null}

              {isInterviewStarted && currentQuestion ? (
                <div className="space-y-4">
                  <div className="soft-grain rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4edea3]">
                      Question {currentQuestionIndex + 1} of {questions.length} · {currentQuestion.type}
                    </p>
                    <p className="mt-3 text-xl font-bold leading-relaxed">{currentQuestion.question}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => speakQuestion(currentQuestionIndex)}
                      disabled={isSpeaking}
                      className="rounded-lg border border-[#404945] bg-[#2a2a2a] px-4 py-2.5 text-sm font-semibold text-[#e5e2e1] transition hover:border-[#4edea3] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSpeaking ? "Speaking..." : "Read Question Aloud"}
                    </button>
                    <button
                      type="button"
                      onClick={startListening}
                      disabled={isListening || isInterviewCompleted}
                      className="rounded-lg bg-[#00402a] px-4 py-2.5 text-sm font-semibold text-[#4edea3] transition hover:bg-[#005236] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isListening ? "Listening..." : "Start Voice Answer"}
                    </button>
                    <button
                      type="button"
                      onClick={stopListening}
                      disabled={!isListening}
                      className="rounded-lg border border-[#93000a]/60 bg-[#93000a]/20 px-4 py-2.5 text-sm font-semibold text-[#ffdad6] transition disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Stop Listening
                    </button>
                  </div>

                  <div>
                    <label htmlFor="answer" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a938f]">
                      Live Transcript (editable)
                    </label>
                    <textarea
                      id="answer"
                      rows={6}
                      value={answers[currentQuestionIndex] ?? ""}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      placeholder="Use your microphone or type your answer..."
                      className="w-full rounded-lg border border-[#404945] bg-[#1c1b1b] px-4 py-3 text-[#e5e2e1] placeholder:text-[#8a938f] focus:border-[#4edea3] focus:ring-0"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={moveToNextQuestion}
                    className="auteur-gradient rounded-lg px-6 py-3 text-sm font-bold text-[#003824]"
                  >
                    {currentQuestionIndex === questions.length - 1 ? "Finish Interview" : "Next Question"}
                  </button>
                </div>
              ) : null}
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#ffb95f]">Coach Lens</p>
                <p className="mt-3 text-sm text-[#cec5bf]">
                  Keep answers structured: situation, action, and measurable outcome.
                </p>
              </div>

              {isInterviewCompleted ? (
                <div className="rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-5">
                  <h3 className="text-xl font-bold">Interview Summary</h3>
                  <div className="mt-4 space-y-3">
                    {questions.map((question, index) => (
                      <div key={`${question.id}-${index}`} className="rounded-lg border border-[#404945]/25 bg-[#201f1f] p-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-[#4edea3]">Q{index + 1} · {question.type}</p>
                        <p className="mt-1 text-sm text-[#e5e2e1]">{question.question}</p>
                        <p className="mt-2 text-xs text-[#cec5bf]">{answers[index]?.trim() ? answers[index] : "No answer captured."}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/review"
                      className="auteur-gradient rounded-lg px-4 py-2.5 text-sm font-bold text-[#003824]"
                    >
                      View Improvement Review
                    </Link>
                    {!hasAnyAnswers ? (
                      <p className="text-xs text-[#ffb95f]">Add at least one answer for meaningful review feedback.</p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-[#404945]/30 bg-[#1c1b1b] p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a938f]">Environment Check</p>
                  <ul className="mt-3 space-y-2 text-sm text-[#cec5bf]">
                    <li className="flex items-center justify-between"><span>Microphone</span><span className="text-[#4edea3]">Ready</span></li>
                    <li className="flex items-center justify-between"><span>Voice Playback</span><span className="text-[#4edea3]">Ready</span></li>
                    <li className="flex items-center justify-between"><span>Transcript Mode</span><span className="text-[#4edea3]">Live</span></li>
                  </ul>
                </div>
              )}
            </aside>
          </section>
        ) : null}
      </div>
    </main>
  );
}
