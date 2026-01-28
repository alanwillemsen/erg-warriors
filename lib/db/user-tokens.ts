import { prisma } from "./client";
import { refreshAccessToken } from "@/lib/concept2/oauth";

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  concept2_user_id: string;
}

/**
 * Store Concept2 tokens for a user
 */
export async function storeTokens(userId: string, tokens: TokenData) {
  await prisma.account.upsert({
    where: {
      provider_userId: {
        provider: "concept2",
        userId,
      },
    },
    update: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
      providerAccountId: tokens.concept2_user_id,
    },
    create: {
      userId,
      type: "oauth",
      provider: "concept2",
      providerAccountId: tokens.concept2_user_id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
      scope: "user:read,results:read",
    },
  });
}

/**
 * Get Concept2 tokens for a user
 */
export async function getTokens(
  userId: string
): Promise<TokenData | null> {
  const account = await prisma.account.findUnique({
    where: {
      provider_userId: {
        provider: "concept2",
        userId,
      },
    },
  });

  if (!account || !account.access_token || !account.refresh_token) {
    return null;
  }

  return {
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expires_at: account.expires_at || 0,
    concept2_user_id: account.providerAccountId || "",
  };
}

/**
 * Get Concept2 tokens by Discord ID
 */
export async function getTokensByDiscordId(
  discordId: string
): Promise<TokenData | null> {
  const user = await prisma.user.findUnique({
    where: { discordId },
    include: {
      accounts: {
        where: { provider: "concept2" },
      },
    },
  });

  if (!user || user.accounts.length === 0) {
    return null;
  }

  const account = user.accounts[0];

  if (!account.access_token || !account.refresh_token) {
    return null;
  }

  return {
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expires_at: account.expires_at || 0,
    concept2_user_id: account.providerAccountId || "",
  };
}

/**
 * Refresh user token if expired
 */
export async function refreshUserToken(userId: string): Promise<string> {
  const tokens = await getTokens(userId);

  if (!tokens) {
    throw new Error("No tokens found for user");
  }

  // Check if token needs refresh (with 5 minute buffer)
  const now = Math.floor(Date.now() / 1000);
  const needsRefresh = tokens.expires_at - 300 < now;

  if (!needsRefresh) {
    return tokens.access_token;
  }

  // Refresh the token
  try {
    const newTokens = await refreshAccessToken(tokens.refresh_token);

    // Store updated tokens
    await storeTokens(userId, {
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + newTokens.expires_in,
      concept2_user_id: tokens.concept2_user_id,
    });

    return newTokens.access_token;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    throw new Error("Failed to refresh access token");
  }
}

/**
 * Get all users with Concept2 linked
 */
export async function getAllLinkedUsers() {
  const users = await prisma.user.findMany({
    include: {
      accounts: {
        where: { provider: "concept2" },
      },
    },
  });

  return users.filter((user) => user.accounts.length > 0);
}

/**
 * Check if a user has Concept2 linked
 */
export async function hasConcept2Linked(userId: string): Promise<boolean> {
  const account = await prisma.account.findUnique({
    where: {
      provider_userId: {
        provider: "concept2",
        userId,
      },
    },
  });

  return !!account;
}
