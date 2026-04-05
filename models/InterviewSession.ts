import { Model, Schema, model, models, Types } from "mongoose";

export interface IInterviewSession {
  userId: Types.ObjectId;
  role: string;
  industry: string;
  experience: string;
  overallScore: number;
  clarityScore: number;
  confidenceScore: number;
  structureScore: number;
  specificityScore: number;
  impactScore: number;
  items: {
    id: number;
    question: string;
    type: string;
    answer: string;
    durationSeconds?: number;
  }[];
  completedAt: Date;
}

const interviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: { type: String, required: true },
    industry: { type: String, required: true },
    experience: { type: String, required: true },
    overallScore: { type: Number, required: true },
    clarityScore: { type: Number, required: true },
    confidenceScore: { type: Number, required: true },
    structureScore: { type: Number, required: true },
    specificityScore: { type: Number, required: true },
    impactScore: { type: Number, required: true },
    items: [
      {
        id: { type: Number, required: true },
        question: { type: String, required: true },
        type: { type: String, required: true },
        answer: { type: String, required: false, default: "" },
        durationSeconds: { type: Number, required: false },
      },
    ],
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const InterviewSession =
  (models.InterviewSession as Model<IInterviewSession>) ||
  model<IInterviewSession>("InterviewSession", interviewSessionSchema);

export default InterviewSession;
