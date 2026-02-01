"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";

export function LinkConcept2() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Link Your Concept2 Account</CardTitle>
        <CardDescription>
          Connect your Concept2 Logbook to view your workout data on the leaderboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild size="lg" className="bg-[#7CAB68] hover:bg-[#6A9458] text-white">
          <a href="/auth/concept2/link">
            <Link2 className="mr-2 h-5 w-5" />
            Link Concept2 Account
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
