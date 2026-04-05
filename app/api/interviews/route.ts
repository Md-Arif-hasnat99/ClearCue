import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";
import { computeSessionScores } from "@/lib/score-analyzer";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { role, industry, experience, items, completedAt } = body;

    if (!role || !industry || !experience || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    const {
      overallScore,
      clarity,
      confidence,
      structure,
      specificity,
      impact,
    } = computeSessionScores(items);

    await connectDB();

    const created = await InterviewSession.create({
      userId: new Types.ObjectId(session.user.id),
      role,
      industry,
      experience,
      overallScore,
      clarityScore: clarity,
      confidenceScore: confidence,
      structureScore: structure,
      specificityScore: specificity,
      impactScore: impact,
      items,
      completedAt: completedAt ? new Date(completedAt) : new Date(),
    });

    return NextResponse.json(
      { message: "Interview session saved successfully", id: created._id },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save interview session" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);

    await connectDB();

    const sessions = await InterviewSession.find({ userId: new Types.ObjectId(session.user.id) })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch interview sessions" },
      { status: 500 }
    );
  }
}
