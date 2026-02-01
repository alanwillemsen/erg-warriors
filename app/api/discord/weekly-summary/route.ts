import { NextRequest, NextResponse } from "next/server";
import { getLeaderboardData } from "@/lib/concept2/aggregator";
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";

// Simple authentication - you can make this more secure
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "change-me-in-production";

export async function GET(request: NextRequest) {
  // Check authentication
  const authHeader = request.headers.get("authorization");
  const token = request.nextUrl.searchParams.get("token");
  const vercelCronSecret = request.headers.get("x-vercel-cron-secret");

  // Debug logging
  console.log("WEBHOOK_SECRET from env:", WEBHOOK_SECRET);
  console.log("Token from request:", token);
  console.log("Token matches:", token === WEBHOOK_SECRET);

  // Allow Vercel cron jobs (production) or our custom token (development/manual trigger)
  const isVercelCron = vercelCronSecret === process.env.CRON_SECRET;
  const isAuthorized = authHeader === `Bearer ${WEBHOOK_SECRET}` || token === WEBHOOK_SECRET;

  if (!isVercelCron && !isAuthorized) {
    return NextResponse.json({
      error: "Unauthorized",
      debug: {
        hasToken: !!token,
        hasAuthHeader: !!authHeader,
        secretConfigured: !!WEBHOOK_SECRET,
      }
    }, { status: 401 });
  }

  try {
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!discordWebhookUrl) {
      return NextResponse.json(
        { error: "Discord webhook URL not configured" },
        { status: 500 }
      );
    }

    // Get last week's data (previous Monday to Sunday)
    const now = new Date();
    const lastWeek = subWeeks(now, 1);
    const weekStart = startOfWeek(lastWeek, { weekStartsOn: 1 }); // Last Monday
    const weekEnd = endOfWeek(lastWeek, { weekStartsOn: 1 }); // Last Sunday

    const leaderboard = await getLeaderboardData({
      from: weekStart,
      to: weekEnd,
    });

    if (leaderboard.length === 0) {
      return NextResponse.json({
        message: "No workout data available this week",
        sent: false,
      });
    }

    // Separate by gender
    const men = leaderboard.filter(e => e.gender?.toLowerCase() === 'm' || e.gender?.toLowerCase() === 'male');
    const women = leaderboard.filter(e => e.gender?.toLowerCase() === 'f' || e.gender?.toLowerCase() === 'female');

    // Get top 3 for each, excluding anyone with zero meters
    const topMen = men.slice(0, 3).filter(e => e.totalMeters > 0);
    const topWomen = women.slice(0, 3).filter(e => e.totalMeters > 0);

    // Format Discord message
    const medals = ["🥇", "🥈", "🥉"];

    const formatLeaders = (leaders: typeof leaderboard) => {
      return leaders
        .map((entry, index) => {
          const metersFormatted = entry.totalMeters.toLocaleString();
          return `${medals[index]} **${entry.discordName}**
   • ${metersFormatted}m | ${entry.workoutCount} workouts`;
        })
        .join("\n\n");
    };

    let description = "";

    if (topMen.length > 0) {
      description += `**👨 Men**\n\n${formatLeaders(topMen)}`;
    }

    if (topWomen.length > 0) {
      if (description) description += "\n\n";
      description += `**👩 Women**\n\n${formatLeaders(topWomen)}`;
    }

    if (!description) {
      return NextResponse.json({
        message: "No workout data available this week",
        sent: false,
      });
    }

    // Get the app URL from environment or use production URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://your-app-url.vercel.app";

    const embed = {
      title: "🏆 Top Rowers Last Week",
      description: description + `\n\n[📊 View Full Leaderboard](${appUrl})`,
      color: 0x5865f2, // Discord blurple
      footer: {
        text: "Keep up the great work! 💪",
      },
      timestamp: new Date().toISOString(),
    };

    // Send to Discord
    const response = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Discord webhook error:", errorText);
      return NextResponse.json(
        { error: "Failed to send Discord message", details: errorText },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Weekly summary sent to Discord",
      sent: true,
      topMen: topMen.map(e => ({
        name: e.discordName,
        meters: e.totalMeters,
      })),
      topWomen: topWomen.map(e => ({
        name: e.discordName,
        meters: e.totalMeters,
      })),
    });
  } catch (error) {
    console.error("Error sending weekly summary:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
