import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { applyPracticeCompletion } from "@/lib/gamification";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findById(session.user.id)
      .select("currentStreak longestStreak lastPracticeDate badges")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const progress = applyPracticeCompletion({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastPracticeDate: user.lastPracticeDate,
      badges: user.badges,
    });

    if (progress.shouldPersist) {
      await User.updateOne(
        { _id: session.user.id },
        {
          $set: {
            currentStreak: progress.currentStreak,
            longestStreak: progress.longestStreak,
            lastPracticeDate: progress.lastPracticeDate,
            badges: progress.badges,
          },
        }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";

    return NextResponse.json(
      { error: `Unable to update practice streak: ${message}` },
      { status: 500 }
    );
  }
}
