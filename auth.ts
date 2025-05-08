import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const runtime = 'nodejs';

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [], // Добавьте ваши провайдеры здесь
  callbacks: {
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
}); 