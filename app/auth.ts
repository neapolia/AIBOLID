import NextAuth, { type AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import { UserRole } from "./lib/types";

// Временное хранилище пользователей (в реальном приложении будет база данных)
const users = [
  {
    id: "1",
    name: "Director",
    email: "director@example.com",
    password: "director", // В реальном приложении пароль будет хеширован
    role: "director" as UserRole,
  },
  {
    id: "2",
    name: "User",
    email: "user@example.com",
    password: "user", // В реальном приложении пароль будет хеширован
    role: "user" as UserRole,
  },
];

export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "example@mail.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Необходимо указать email и пароль");
        }

        const user = users.find(user => user.email === credentials.email);

        if (!user || user.password !== credentials.password) {
          throw new Error("Неверный email или пароль");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        } as User;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login", // Страница для отображения ошибок аутентификации
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User | null }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key", // В реальном приложении используйте переменную окружения
};

export const { auth, signIn, signOut } = NextAuth(authOptions); 