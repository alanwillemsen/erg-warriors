import { Concept2Client } from "./client";
import type {
  Concept2Result,
  LeaderboardEntry,
  DateRange,
} from "./types";
import { getTokensByDiscordId } from "@/lib/db/user-tokens";
import { refreshAccessToken } from "./oauth";
import { prisma } from "@/lib/db/client";

/**
 * Aggregate results to calculate total meters and stats
 */
export function aggregateResults(results: Concept2Result[]): {
  totalMeters: number;
  workoutCount: number;
  totalHours: number;
  lastWorkout?: string;
} {
  if (results.length === 0) {
    return {
      totalMeters: 0,
      workoutCount: 0,
      totalHours: 0,
    };
  }

  const totalMeters = results.reduce(
    (sum, result) => sum + result.distance,
    0
  );

  // Calculate total time in hours (time is in tenths of a second/deciseconds)
  const totalDeciseconds = results.reduce(
    (sum, result) => sum + (result.time || 0),
    0
  );
  const totalHours = totalDeciseconds / 36000; // 10 deciseconds per second * 3600 seconds per hour

  // Sort by date to get last workout
  const sortedResults = [...results].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return {
    totalMeters,
    workoutCount: results.length,
    totalHours,
    lastWorkout: sortedResults[0]?.date,
  };
}

/**
 * Get valid access token for a user (refresh if needed)
 */
async function getValidAccessToken(
  discordId: string
): Promise<string | null> {
  const tokens = await getTokensByDiscordId(discordId);

  if (!tokens) {
    return null;
  }

  // Check if token needs refresh (with 5 minute buffer)
  const now = Math.floor(Date.now() / 1000);
  const needsRefresh = tokens.expires_at - 300 < now;

  if (!needsRefresh) {
    return tokens.access_token;
  }

  // Refresh the token
  try {
    const newTokens = await refreshAccessToken(tokens.refresh_token);

    // Find user by discordId and update tokens
    const user = await prisma.user.findUnique({
      where: { discordId },
    });

    if (!user) {
      return null;
    }

    await prisma.account.update({
      where: {
        provider_userId: {
          provider: "concept2",
          userId: user.id,
        },
      },
      data: {
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + newTokens.expires_in,
      },
    });

    return newTokens.access_token;
  } catch (error) {
    console.error(`Failed to refresh token for user ${discordId}:`, error);
    return null;
  }
}

/**
 * Fetch and aggregate data for a single user
 */
async function fetchUserData(
  discordId: string,
  discordName: string,
  discordAvatar: string | undefined,
  dateRange: DateRange
): Promise<LeaderboardEntry | null> {
  try {
    const accessToken = await getValidAccessToken(discordId);

    if (!accessToken) {
      console.warn(`No valid access token for user ${discordName}`);
      return null;
    }

    const client = new Concept2Client(accessToken);
    const results = await client.getAllResults(dateRange.from, dateRange.to);

    const stats = aggregateResults(results);

    return {
      rank: 0, // Will be set after sorting
      userId: "", // We don't need this for now
      discordId,
      discordName,
      discordAvatar,
      ...stats,
    };
  } catch (error) {
    console.error(`Error fetching data for user ${discordName}:`, error);
    return null;
  }
}

/**
 * Get leaderboard data for all linked users
 */
export async function getLeaderboardData(
  dateRange: DateRange
): Promise<LeaderboardEntry[]> {
  // Get all users with Concept2 linked who want to be shown on leaderboard
  const users = await prisma.user.findMany({
    where: {
      showOnLeaderboard: true,
    },
    include: {
      accounts: {
        where: { provider: "concept2" },
      },
    },
  });

  const linkedUsers = users.filter((user) => user.accounts.length > 0);

  if (linkedUsers.length === 0) {
    return [];
  }

  // Fetch data for all users in parallel
  const entries = await Promise.all(
    linkedUsers
      .filter((user) => user.discordId && (user.displayName || user.discordName))
      .map((user) =>
        fetchUserData(
          user.discordId!,
          user.displayName || user.discordName || "Unknown",
          user.discordAvatar || undefined,
          dateRange
        )
      )
  );

  // Filter out null entries and sort by total meters
  const validEntries = entries.filter(
    (entry): entry is LeaderboardEntry => entry !== null
  );

  validEntries.sort((a, b) => b.totalMeters - a.totalMeters);

  // Assign ranks
  validEntries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return validEntries;
}
