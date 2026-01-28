import { Concept2TokenSchema, type Concept2Token } from "./types";

const CONCEPT2_AUTH_URL = "https://log.concept2.com/oauth/authorize";
const CONCEPT2_TOKEN_URL = "https://log.concept2.com/oauth/access_token";

/**
 * Generate Concept2 OAuth authorization URL
 */
export function generateAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.CONCEPT2_CLIENT_ID!,
    redirect_uri: process.env.CONCEPT2_REDIRECT_URI!,
    response_type: "code",
    scope: "user:read,results:read",
    state,
  });

  return `${CONCEPT2_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access and refresh tokens
 */
export async function exchangeCodeForToken(
  code: string
): Promise<Concept2Token> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: process.env.CONCEPT2_CLIENT_ID!,
    client_secret: process.env.CONCEPT2_CLIENT_SECRET!,
    redirect_uri: process.env.CONCEPT2_REDIRECT_URI!,
  });

  const response = await fetch(CONCEPT2_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  const data = await response.json();
  return Concept2TokenSchema.parse(data);
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<Concept2Token> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: process.env.CONCEPT2_CLIENT_ID!,
    client_secret: process.env.CONCEPT2_CLIENT_SECRET!,
    scope: "user:read,results:read",
  });

  const response = await fetch(CONCEPT2_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  const data = await response.json();
  return Concept2TokenSchema.parse(data);
}

/**
 * Generate a random state parameter for CSRF protection
 */
export function generateState(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}
