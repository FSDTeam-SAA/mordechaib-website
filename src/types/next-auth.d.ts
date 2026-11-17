import { DefaultSession } from "next-auth";

type AuthUserFields = {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  language: string;
  role: string;
  status: string;
  isPlatformAdmin: boolean;
  isEmailVerified: boolean;
  profileImage: string | null;
  accessToken: string;
  accessTokenExpiresAt?: number;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

declare module "next-auth" {
  interface Session {
    user: AuthUserFields & DefaultSession["user"];
    error?: string;
  }

  interface User {
    id: string;
    organizationId: string;
    firstName: string;
    lastName: string;
    email: string;
    language: string;
    role: string;
    status: string;
    isPlatformAdmin: boolean;
    isEmailVerified: boolean;
    profileImage: string | null;
    accessToken: string;
    accessTokenExpiresAt?: number;
    refreshToken: string;
    refreshTokenExpiresAt: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    organizationId: string;
    firstName: string;
    lastName: string;
    email: string;
    language: string;
    role: string;
    status: string;
    isPlatformAdmin: boolean;
    isEmailVerified: boolean;
    profileImage: string | null;
    accessToken: string;
    accessTokenExpiresAt?: number;
    refreshToken: string;
    refreshTokenExpiresAt: string;
    error?: string;
  }
}
