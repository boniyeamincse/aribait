import { DefaultSession } from "next-auth";

type Role = "STUDENT" | "ADMIN";
type Status = "PENDING" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      status: Status;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    status: Status;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    status: Status;
  }
}
