"use client";

import { Button } from "@/components/ui/button";
import type { TimePeriod } from "@/lib/concept2/types";

interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

export function TimePeriodSelector({
  selectedPeriod,
  onPeriodChange,
}: TimePeriodSelectorProps) {
  const periods: { value: TimePeriod; label: string }[] = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={selectedPeriod === period.value ? "default" : "outline"}
          onClick={() => onPeriodChange(period.value)}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
}
