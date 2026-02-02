"use client";

import { Button } from "@/components/ui/button";
import type { GenderFilter } from "@/lib/utils/gender";

interface GenderFilterProps {
  selectedGender: GenderFilter;
  onGenderChange: (gender: GenderFilter) => void;
}

export function GenderFilter({
  selectedGender,
  onGenderChange,
}: GenderFilterProps) {
  const filters: { value: GenderFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "male", label: "Men" },
    { value: "female", label: "Women" },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={selectedGender === filter.value ? "default" : "outline"}
          onClick={() => onGenderChange(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
