import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles?: string[] | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roles?: string[] | null;
    rolesRefreshedAt?: number; // Unix timestamp of last roles refresh
  }
}
