import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      discordId: string;
      discordName: string;
      discordAvatar?: string;
      hasConcept2Linked: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    discordId: string;
    discordName: string;
    discordAvatar?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    discordId: string;
    discordName: string;
    discordAvatar?: string;
    hasConcept2Linked: boolean;
  }
}
