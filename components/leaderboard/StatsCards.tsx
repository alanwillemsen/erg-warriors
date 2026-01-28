"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Activity, Users } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/concept2/types";

interface StatsCardsProps {
  entries: LeaderboardEntry[];
}

export function StatsCards({ entries }: StatsCardsProps) {
  const totalMeters = entries.reduce((sum, entry) => sum + entry.totalMeters, 0);
  const totalWorkouts = entries.reduce((sum, entry) => sum + entry.workoutCount, 0);
  const topPerformer = entries[0];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Meters</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalMeters.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Across all participants
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWorkouts}</div>
          <p className="text-xs text-muted-foreground">
            Combined sessions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {topPerformer?.discordName || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {topPerformer
              ? `${topPerformer.totalMeters.toLocaleString()} meters`
              : "No data"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
