"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { TimePeriodSelector } from "@/components/leaderboard/TimePeriodSelector";
import { StatsCards } from "@/components/leaderboard/StatsCards";
import { RefreshCw, LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import type { TimePeriod, LeaderboardEntry } from "@/lib/concept2/types";
import Link from "next/link";
import { APP_NAME } from "@/lib/config";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [period, setPeriod] = useState<TimePeriod>("week");
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, error, isLoading, mutate } = useSWR<LeaderboardEntry[]>(
    session ? `/api/leaderboard?period=${period}&_key=${refreshKey}` : null,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, session, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleRefresh = async () => {
    setRefreshKey((prev) => prev + 1);
    await mutate();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{APP_NAME}</h1>
            <p className="text-muted-foreground">
              Welcome back, {session.user.discordName}!
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Link href="/profile">
              <Button variant="outline">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Concept2 Link Banner */}
        {!session.user.hasConcept2Linked && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Link Your Concept2 Account
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Connect your Concept2 Logbook to appear on the leaderboard and compete with others.
                </p>
                <Link href="/onboarding">
                  <Button size="sm">
                    Link Concept2 Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Time Period Selector */}
        <div className="mb-6">
          <TimePeriodSelector
            selectedPeriod={period}
            onPeriodChange={setPeriod}
          />
        </div>

        {/* Stats Cards */}
        {data && data.length > 0 && (
          <div className="mb-8">
            <StatsCards entries={data} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive font-medium">
              Failed to load leaderboard data. Please try again.
            </p>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Rankings</h2>
          <LeaderboardTable entries={data || []} isLoading={isLoading} />
        </div>
      </div>
    </main>
  );
}
