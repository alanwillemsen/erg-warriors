import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getLeaderboardData } from "@/lib/concept2/aggregator";
import { getDateRangeForPeriod } from "@/lib/utils/date-periods";
import { z } from "zod";
import { cache } from "@/lib/utils/cache";
import type { TimePeriod } from "@/lib/concept2/types";

// Request validation schema
const QuerySchema = z.object({
  period: z.enum(["week", "month", "year", "custom"]).default("week"),
  from: z.string().optional(),
  to: z.string().optional(),
  refresh: z.string().optional(), // Force cache refresh
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = QuerySchema.parse({
      period: searchParams.get("period") || "week",
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
      refresh: searchParams.get("refresh") || undefined,
    });

    // Generate cache key
    const cacheKey = `leaderboard:${params.period}:${params.from || ""}:${params.to || ""}`;

    // Check cache (unless refresh is requested)
    if (!params.refresh) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    // Get date range
    let dateRange;
    try {
      if (params.period === "custom") {
        if (!params.from || !params.to) {
          return NextResponse.json(
            { error: "Custom period requires 'from' and 'to' parameters" },
            { status: 400 }
          );
        }
        dateRange = getDateRangeForPeriod(
          params.period as TimePeriod,
          new Date(params.from),
          new Date(params.to)
        );
      } else {
        dateRange = getDateRangeForPeriod(params.period as TimePeriod);
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid date parameters" },
        { status: 400 }
      );
    }

    // Fetch leaderboard data
    const leaderboard = await getLeaderboardData(dateRange);

    // Cache the result for 5 minutes
    cache.set(cacheKey, leaderboard, 300);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error in leaderboard API:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Invalidate cache endpoint (POST)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Clear entire cache
    cache.clear();

    return NextResponse.json({ success: true, message: "Cache cleared" });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
