"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LeaderboardEntry } from "@/lib/concept2/types";
import { format } from "date-fns";
import Image from "next/image";
import { Trophy, Medal, Award, ArrowUpDown, ArrowUp, ArrowDown, Info } from "lucide-react";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
}

type SortColumn = "rank" | "discordName" | "gender" | "totalMeters" | "workoutCount" | "totalHours" | "totalCalories" | "fatBurned" | "lastWorkout";
type SortDirection = "asc" | "desc";

export function LeaderboardTable({
  entries,
  isLoading,
}: LeaderboardTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedEntries = useMemo(() => {
    const sorted = [...entries].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case "rank":
          aValue = a.rank;
          bValue = b.rank;
          break;
        case "discordName":
          aValue = a.discordName.toLowerCase();
          bValue = b.discordName.toLowerCase();
          break;
        case "gender":
          aValue = (a.gender || "").toLowerCase();
          bValue = (b.gender || "").toLowerCase();
          break;
        case "totalMeters":
          aValue = a.totalMeters;
          bValue = b.totalMeters;
          break;
        case "workoutCount":
          aValue = a.workoutCount;
          bValue = b.workoutCount;
          break;
        case "totalHours":
          aValue = a.totalHours;
          bValue = b.totalHours;
          break;
        case "totalCalories":
          aValue = a.totalCalories;
          bValue = b.totalCalories;
          break;
        case "fatBurned":
          aValue = a.totalCalories / 3500;
          bValue = b.totalCalories / 3500;
          break;
        case "lastWorkout":
          aValue = a.lastWorkout ? new Date(a.lastWorkout).getTime() : 0;
          bValue = b.lastWorkout ? new Date(b.lastWorkout).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [entries, sortColumn, sortDirection]);

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 inline opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4 inline" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4 inline" />
    );
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No workout data available for this period.
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="w-16 cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("rank")}
              >
                Rank
                <SortIcon column="rank" />
              </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("discordName")}
            >
              Athlete
              <SortIcon column="discordName" />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("gender")}
            >
              Gender
              <SortIcon column="gender" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("totalMeters")}
            >
              Total Meters
              <SortIcon column="totalMeters" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("workoutCount")}
            >
              Workouts
              <SortIcon column="workoutCount" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("totalHours")}
            >
              Total Hours
              <SortIcon column="totalHours" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("totalCalories")}
            >
              Total Calories
              <SortIcon column="totalCalories" />
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("fatBurned")}
            >
              <div className="flex items-center justify-end gap-1">
                Fat Burned (lbs)
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Estimated pounds of fat burned</p>
                    <p className="text-xs text-muted-foreground">Based on 3,500 calories per pound</p>
                  </TooltipContent>
                </Tooltip>
                <SortIcon column="fatBurned" />
              </div>
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("lastWorkout")}
            >
              Last Workout
              <SortIcon column="lastWorkout" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEntries.map((entry) => (
            <TableRow key={entry.discordId}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {entry.rank === 1 && <Trophy className="h-5 w-5 text-[#FED34C]" />}
                  {entry.rank === 2 && <Medal className="h-5 w-5 text-gray-400" />}
                  {entry.rank === 3 && <Award className="h-5 w-5 text-[#EAAB00]" />}
                  <span className="font-bold">{entry.rank}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  {entry.discordAvatar ? (
                    <Image
                      src={`https://cdn.discordapp.com/avatars/${entry.discordId}/${entry.discordAvatar}.png`}
                      alt={entry.discordName}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                      {entry.discordName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium">{entry.discordName}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {entry.gender ? entry.gender.charAt(0).toUpperCase() + entry.gender.slice(1) : "N/A"}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {entry.totalMeters.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="secondary">{entry.workoutCount}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {entry.totalHours.toFixed(1)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {entry.totalCalories.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {(entry.totalCalories / 3500).toFixed(1)}
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {entry.lastWorkout
                  ? format(new Date(entry.lastWorkout), "MMM d, yyyy")
                  : "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </TooltipProvider>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
