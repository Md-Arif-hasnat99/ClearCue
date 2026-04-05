import { NextResponse, type NextRequest } from "next/server";

import { handlers } from "@/auth";
import { rateLimit } from "@/lib/rate-limiter";

const LOGIN_LIMIT = { maxRequests: 5, windowMs: 60 * 1000 };

const originalPost = handlers.POST;

export const POST = async (request: NextRequest) => {
  const limit = rateLimit(request.headers, LOGIN_LIMIT);

  if (!limit.success) {
    const retryAfter = Math.ceil((limit.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${retryAfter}s.` },
      { status: 429 },
    );
  }

  return originalPost(request);
};

export const GET = handlers.GET;
