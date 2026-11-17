import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getJwtExpirationTime, isJwtExpired } from "./auth-token";

type LoginUser = {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  language: string;
  role: string;
  status: string;
  isPlatformAdmin: boolean;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  updatedAt: string;
  profileImage?: string | null;
};

type LoginResponse = {
  success: boolean;
  message?: string;
  data?: {
    user: LoginUser;
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresAt: string;
  };
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      name: "next-auth.session-token-website",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email" },
        password: { label: "Password", type: "password", placeholder: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          const response = (await res.json()) as LoginResponse;

          if (!res.ok || !response.success || !response.data?.user) {
            throw new Error(response?.message || "Login failed");
          }

          const {
            user,
            accessToken,
            refreshToken,
            refreshTokenExpiresAt,
            accessTokenExpiresIn,
          } = response.data;

          const decodedExp = getJwtExpirationTime(accessToken);
          const accessTokenExpiresAt =
            decodedExp ?? Date.now() + (accessTokenExpiresIn || 3600) * 1000;

          return {
            id: user.id,
            organizationId: user.organizationId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            language: user.language,
            role: user.role,
            status: user.status,
            isPlatformAdmin: user.isPlatformAdmin,
            isEmailVerified: user.emailVerified,
            profileImage: user.profileImage ?? null,
            refreshToken,
            refreshTokenExpiresAt,
            accessToken,
            accessTokenExpiresAt,
          };
        } catch (error) {
          console.error("Authentication error:", error);

          const errorMessage =
            error instanceof Error
              ? error.message
              : "Authentication failed. Please try again.";

          throw new Error(errorMessage);
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.organizationId = user.organizationId;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.email = user.email;
        token.language = user.language;
        token.role = user.role;
        token.status = user.status;
        token.isPlatformAdmin = user.isPlatformAdmin;
        token.isEmailVerified = user.isEmailVerified;
        token.profileImage = user.profileImage;
        token.refreshToken = user.refreshToken;
        token.refreshTokenExpiresAt = user.refreshTokenExpiresAt;
        token.accessToken = user.accessToken;
        token.accessTokenExpiresAt = user.accessTokenExpiresAt;
      }

      // Check if access token is expired
      const accessToken = token.accessToken as string | undefined;
      if (accessToken && isJwtExpired(accessToken)) {
        token.error = "AccessTokenExpired";
      }

      return token;
    },

    async session({ session, token }) {
      if (token.error === "AccessTokenExpired") {
        session.error = "AccessTokenExpired";
      }

      session.user = {
        id: token.id,
        organizationId: token.organizationId,
        firstName: token.firstName,
        lastName: token.lastName,
        email: token.email,
        language: token.language,
        role: token.role,
        status: token.status,
        isPlatformAdmin: token.isPlatformAdmin,
        isEmailVerified: token.isEmailVerified,
        profileImage: token.profileImage,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt as number | undefined,
      };

      return session;
    },
  },
};
