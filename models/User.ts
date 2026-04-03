import { Model, Schema, model, models } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  badges: ("first_practice" | "streak_3" | "streak_7" | "streak_30")[];
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPracticeDate: {
      type: String,
      default: null,
    },
    badges: {
      type: [String],
      enum: ["first_practice", "streak_3", "streak_7", "streak_30"],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

const User = (models.User as Model<IUser>) || model<IUser>("User", userSchema);

export default User;
