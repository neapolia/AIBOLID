import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { User } from "next-auth";

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials: Partial<Record<string, unknown>>) {
        const username = credentials?.username as string;
        const password = credentials?.password as string;

        if (!username || !password) return null;

        if (username === "director" && password === "director") {
          return {
            id: "1",
            name: "Director",
            email: "director@example.com",
            role: "director",
          } as User;
        }

        if (username === "user" && password === "user") {
          return {
            id: "2",
            name: "User",
            email: "user@example.com",
            role: "user",
          } as User;
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnApprove = nextUrl.pathname.startsWith("/dashboard/approve");

      if (isOnApprove) {
        if (isLoggedIn && auth?.user?.role === "director") return true;
        return false;
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

export const { auth, signIn, signOut } = NextAuth(authConfig); 