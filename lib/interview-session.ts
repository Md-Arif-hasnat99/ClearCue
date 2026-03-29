export type InterviewQuestion = {
  id: number;
  question: string;
  type: string;
};

export type InterviewReviewItem = {
  id: number;
  question: string;
  type: string;
  answer: string;
};

export type InterviewReviewSession = {
  role: string;
  industry: string;
  experience: string;
  completedAt: string;
  items: InterviewReviewItem[];
};

export const INTERVIEW_REVIEW_STORAGE_KEY = "clearcue.latest-interview-session";
