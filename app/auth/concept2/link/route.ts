import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateAuthUrl, generateState } from "@/lib/concept2/oauth";
import { cookies } from "next/headers";

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

  // Generate state for CSRF protection
  const state = generateState();

  // Store state in cookie (expires in 10 minutes)
  const cookieStore = await cookies();
  cookieStore.set("concept2_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  // Generate auth URL and redirect
  const authUrl = generateAuthUrl(state);

  return NextResponse.redirect(authUrl);
}
