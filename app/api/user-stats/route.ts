import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessions = await InterviewSession.find({
      userId: new Types.ObjectId(session.user.id),
      completedAt: { $gte: sevenDaysAgo },
    })
      .sort({ completedAt: 1 }) // Chronological
      .lean();

    if (!sessions.length) {
      // Empty state
      return NextResponse.json({ dimensions: null, weeklyScores: null });
    }

    const toDateKey = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Calculate dimensions average across the trailing 7 days relative to the number of sessions
    const total = sessions.length;
    const dimensions = [
      { label: "Clarity", score: Math.round(sessions.reduce((acc, s) => acc + s.clarityScore, 0) / total) },
      { label: "Confidence", score: Math.round(sessions.reduce((acc, s) => acc + s.confidenceScore, 0) / total) },
      { label: "Structure", score: Math.round(sessions.reduce((acc, s) => acc + s.structureScore, 0) / total) },
      { label: "Specificity", score: Math.round(sessions.reduce((acc, s) => acc + s.specificityScore, 0) / total) },
      { label: "Impact", score: Math.round(sessions.reduce((acc, s) => acc + s.impactScore, 0) / total) },
    ];

    // Build weekly trend based on days. We compress multiple sessions in a day into an average.
    const dayMap = new Map<string, number[]>();
    for (const s of sessions) {
      const dateKey = toDateKey(new Date(s.completedAt));
      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, []);
      }
      dayMap.get(dateKey)!.push(s.overallScore);
    }

    const last5Days = [];
    const today = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = toDateKey(d);
      const dayScores = dayMap.get(dateKey);
      const score = dayScores && dayScores.length ? Math.round(dayScores.reduce((acc, score) => acc + score, 0) / dayScores.length) : 0;
      last5Days.push({ day: d.toLocaleDateString("en-US", { weekday: "short" }), score });
    }

    return NextResponse.json({
      dimensions,
      weeklyScores: last5Days,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}