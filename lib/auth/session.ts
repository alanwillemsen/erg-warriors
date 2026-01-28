import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Get the current session or redirect to sign in
 */
export async function getSession() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return session;
}

/**
 * Get the current session without redirecting
 */
export async function getOptionalSession() {
  return await auth();
}

/**
 * Require Concept2 to be linked, redirect to onboarding if not
 */
export async function requireConcept2Link() {
  const session = await getSession();

  if (!session.user.hasConcept2Linked) {
    redirect("/onboarding");
  }

  return session;
}
