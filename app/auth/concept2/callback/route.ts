import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { exchangeCodeForToken } from "@/lib/concept2/oauth";
import { storeTokens } from "@/lib/db/user-tokens";
import { cookies } from "next/headers";
import { Concept2Client } from "@/lib/concept2/client";

export async function GET(request: NextRequest) {
  // Get the proper base URL from request headers
  const host = request.headers.get("host") || "";
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const baseUrl = `${protocol}://${host}`;

  // Check if user is authenticated
  const session = await auth();

  if (!session) {
    return NextResponse.redirect(new URL("/auth/signin", baseUrl));
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    console.error("Concept2 OAuth error:", error);
    return NextResponse.redirect(
      new URL(`/onboarding?error=${encodeURIComponent(error)}`, baseUrl)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/onboarding?error=missing_parameters", baseUrl)
    );
  }

  // Verify state for CSRF protection
  const cookieStore = await cookies();
  const storedState = cookieStore.get("concept2_oauth_state")?.value;

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL("/onboarding?error=invalid_state", baseUrl)
    );
  }

  // Clear state cookie
  cookieStore.delete("concept2_oauth_state");

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForToken(code);

    // Get Concept2 user profile
    const client = new Concept2Client(tokens.access_token);
    const concept2User = await client.getMe();

    // Store tokens in database
    await storeTokens(session.user.id, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
      concept2_user_id: concept2User.user_id,
    });

    // Update user with gender from Concept2 profile
    const { prisma } = await import("@/lib/db/client");
    await prisma.user.update({
      where: { id: session.user.id },
      data: { gender: concept2User.gender },
    });

    // Redirect to main page
    return NextResponse.redirect(new URL("/?linked=true", baseUrl));
  } catch (error) {
    console.error("Error linking Concept2 account:", error);
    return NextResponse.redirect(
      new URL("/onboarding?error=token_exchange_failed", baseUrl)
    );
  }
}
