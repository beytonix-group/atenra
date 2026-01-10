import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    roles?: string[] | null;
  }

  interface Session {
    user: {
      id: string;
      roles?: string[] | null;
    } & DefaultSession["user"];
    roles?: string[] | null; // Also store at session level as backup
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roles?: string[] | null;
    rolesRefreshedAt?: number; // Unix timestamp of last roles refresh
  }
}
