import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/client";
import { isUserInServer } from "@/lib/discord/server-check";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify guilds",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if user is in the configured Discord server
      if (account?.provider === "discord" && account?.access_token) {
        const serverId = process.env.DISCORD_SERVER_ID;

        if (!serverId) {
          console.error("DISCORD_SERVER_ID not configured");
          return false;
        }

        const isInServer = await isUserInServer(
          account.providerAccountId,
          account.access_token,
          serverId
        );

        if (!isInServer) {
          // User is not in the server, reject sign in
          return "/auth/error?error=NotInServer";
        }
      }

      return true;
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user && account) {
        token.id = user.id;

        // If this is a Discord login, populate Discord info
        if (account.provider === "discord" && account.providerAccountId && profile) {
          // Check if user already has discordId set or if another user has this discordId
          const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
          });

          // Only update if the user doesn't already have a discordId set
          if (!existingUser?.discordId) {
            try {
              const discordUsername = (profile as any).username || user.name || "Unknown";
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  discordId: account.providerAccountId,
                  discordName: discordUsername,
                  discordAvatar: (profile as any).avatar || null,
                  displayName: existingUser?.displayName || discordUsername,
                },
              });
            } catch (error) {
              // If unique constraint fails, it means this Discord account is already linked
              // to another user. We'll just use the current user without the Discord info.
              console.error("Failed to update user with Discord info:", error);
            }
          }

          token.discordId = account.providerAccountId;
          token.discordName = (profile as any).username || user.name || "Unknown";
          token.discordAvatar = (profile as any).avatar || null;
        }

        // Get Discord ID and Concept2 status from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            accounts: {
              where: { provider: "concept2" },
            },
          },
        });

        if (dbUser) {
          token.discordId = dbUser.discordId || token.discordId;
          token.discordName = dbUser.discordName || token.discordName;
          token.discordAvatar = dbUser.discordAvatar || token.discordAvatar || undefined;
          token.hasConcept2Linked = dbUser.accounts.length > 0;
        }
      }

      // Check for Concept2 link status on each request
      if (token.id && !user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: {
            accounts: {
              where: { provider: "concept2" },
            },
          },
        });

        if (dbUser) {
          token.hasConcept2Linked = dbUser.accounts.length > 0;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.discordId = token.discordId as string;
        session.user.discordName = token.discordName as string;
        session.user.discordAvatar = token.discordAvatar as string | undefined;
        session.user.hasConcept2Linked = token.hasConcept2Linked as boolean;
      }

      return session;
    },
  },
});
