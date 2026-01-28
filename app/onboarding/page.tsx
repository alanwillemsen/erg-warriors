"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { LinkConcept2 } from "@/components/onboarding/LinkConcept2";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { APP_NAME } from "@/lib/config";

function OnboardingContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-2xl space-y-4">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl">
              {session?.user?.hasConcept2Linked
                ? "Concept2 Account Linked!"
                : `Welcome to ${APP_NAME}!`}
            </CardTitle>
            <CardDescription>
              You're signed in as {session.user.discordName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {session?.user?.hasConcept2Linked ? (
              <div>
                <p className="text-muted-foreground mb-6">
                  Your Concept2 Logbook account is connected. Your workout data will be displayed on the leaderboard.
                </p>
                <Link href="/">
                  <Button>Go to Leaderboard</Button>
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-muted-foreground mb-6">
                  Link your Concept2 Logbook account to appear on the leaderboard and compete with others.
                  This is optional - you can skip this step and just view the leaderboard.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/">
                    <Button variant="outline">Skip for Now</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-lg">Error Linking Account</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {error === "token_exchange_failed" &&
                  "Failed to exchange authorization code for tokens. Please try again."}
                {error === "invalid_state" &&
                  "Invalid state parameter. This may be a security issue. Please try again."}
                {error === "missing_parameters" &&
                  "Missing required parameters. Please try again."}
                {!["token_exchange_failed", "invalid_state", "missing_parameters"].includes(
                  error
                ) && `An error occurred: ${error}`}
              </p>
            </CardContent>
          </Card>
        )}

        {!session?.user?.hasConcept2Linked && <LinkConcept2 />}
      </div>
    </div>
  );
}

export default function Onboarding() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
