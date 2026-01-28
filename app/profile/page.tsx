"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Link2, Unlink } from "lucide-react";
import Link from "next/link";

interface ProfileData {
  displayName: string | null;
  showOnLeaderboard: boolean;
  discordName: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setDisplayName(data.displayName || data.discordName || "");
        setShowOnLeaderboard(data.showOnLeaderboard);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim() || null,
          showOnLeaderboard,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to update profile" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnlinkConcept2 = async () => {
    if (!confirm("Are you sure you want to unlink your Concept2 account? You will no longer appear on the leaderboard.")) {
      return;
    }

    setIsUnlinking(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile/unlink-concept2", {
        method: "POST",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Concept2 account unlinked successfully!" });
        // Reload the page to update session
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to unlink account" });
      }
    } catch (error) {
      console.error("Error unlinking Concept2:", error);
      setMessage({ type: "error", text: "Failed to unlink account" });
    } finally {
      setIsUnlinking(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leaderboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Customize how you appear on the leaderboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="discordName">Discord Username (read-only)</Label>
              <Input
                id="discordName"
                value={profile?.discordName || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                Your Discord username cannot be changed here
              </p>
            </div>

            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Concept2 Account</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {session?.user?.hasConcept2Linked
                      ? "Your Concept2 account is connected"
                      : "No Concept2 account linked"}
                  </p>
                </div>
                {session?.user?.hasConcept2Linked ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnlinkConcept2}
                    disabled={isUnlinking}
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    {isUnlinking ? "Unlinking..." : "Unlink"}
                  </Button>
                ) : (
                  <Link href="/onboarding">
                    <Button variant="outline" size="sm">
                      <Link2 className="h-4 w-4 mr-2" />
                      Link Account
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter custom display name"
                maxLength={50}
              />
              <p className="text-sm text-muted-foreground">
                This name will appear on the leaderboard instead of your Discord username.
                Leave empty to use your Discord username.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="showOnLeaderboard"
                  checked={showOnLeaderboard}
                  onChange={(e) => setShowOnLeaderboard(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />
                <div className="space-y-1">
                  <Label htmlFor="showOnLeaderboard" className="cursor-pointer">
                    Show on Leaderboard
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Uncheck this to opt-out of appearing on the public leaderboard.
                    Your Concept2 data will still be synced, but won't be visible to others.
                  </p>
                </div>
              </div>
            </div>

            {message && (
              <div
                className={`p-4 rounded-md ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
