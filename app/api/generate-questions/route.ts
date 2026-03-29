import { NextResponse } from "next/server";

const groqApiKey = process.env.GROQ_API_KEY || "";

type InterviewQuestion = {
  id: number;
  question: string;
  type: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobTitle, industry, experience } = body;

    if (!jobTitle || !industry) {
      return NextResponse.json(
        { error: "Missing required fields: jobTitle and industry." },
        { status: 400 }
      );
    }

    if (!groqApiKey || groqApiKey === "your_groq_api_key_here") {
      return NextResponse.json(
        { error: "Groq API key is not properly configured in the server." },
        { status: 500 }
      );
    }

    const prompt = `You are an expert technical recruiter and interviewer. 
Generate 5 tailored interview questions for a candidate applying for a '${jobTitle}' role in the '${industry}' industry. 
The candidate's experience level is '${experience}'.

Provide the output as a valid JSON array of objects, where each object has exactly these keys:
- "id": a unique number counting from 1 to 5
- "question": the interview question text
- "type": the type of question (e.g., "Behavioral", "Technical", "Situational", "General")

CRITICAL: Return ONLY the raw JSON array. Do not include markdown formatting like \`\`\`json or any other conversational text.`;

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.4,
          messages: [
            {
              role: "system",
              content:
                "You generate concise, realistic interview questions and must follow output format exactly.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      return NextResponse.json(
        {
          error: "Groq request failed",
          details: errorText || `HTTP ${groqResponse.status}`,
        },
        { status: 500 }
      );
    }

    const completion = await groqResponse.json();
    const text = completion?.choices?.[0]?.message?.content;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        {
          error: "Groq returned an empty response",
        },
        { status: 500 }
      );
    }

    // Sometimes the AI might still wrap in markdown codeblocks despite instructions, so we clean it
    let cleanText = text.trim();
    if (cleanText.startsWith("\`\`\`json")) {
      cleanText = cleanText.substring(7, cleanText.length - 3).trim();
    } else if (cleanText.startsWith("\`\`\`")) {
      cleanText = cleanText.substring(3, cleanText.length - 3).trim();
    }

    const parsed = JSON.parse(cleanText);
    const questionsSource = Array.isArray(parsed) ? parsed : parsed?.questions;

    if (!Array.isArray(questionsSource)) {
      return NextResponse.json(
        {
          error: "Invalid response shape from Groq",
          details: "Expected a JSON array of questions.",
        },
        { status: 500 }
      );
    }

    const questions: InterviewQuestion[] = questionsSource.map(
      (item: unknown, index: number) => {
        const safeItem =
          item && typeof item === "object"
            ? (item as Record<string, unknown>)
            : {};

        const question =
          typeof safeItem.question === "string" && safeItem.question.trim()
            ? safeItem.question.trim()
            : `Interview question ${index + 1}`;

        const type =
          typeof safeItem.type === "string" && safeItem.type.trim()
            ? safeItem.type.trim()
            : "General";

        return {
          id: index + 1,
          question,
          type,
        };
      }
    );

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    console.error("Error generating questions:", error);
    const details = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: "Failed to generate interview questions",
        details,
      },
      { status: 500 }
    );
  }
}
