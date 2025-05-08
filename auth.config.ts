import Credentials from "next-auth/providers/credentials";
import type { URL } from "url";

export const runtime = 'nodejs';

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        
        // Здесь должна быть ваша логика проверки пользователя
        // Например, проверка в базе данных
        if (credentials.username === "director" && credentials.password === "director") {
          return {
            id: "1",
            name: "Директор",
            email: "director@example.com",
            role: "director",
          };
        }
        if (credentials.username === "user" && credentials.password === "user") {
          return {
            id: "2",
            name: "Пользователь",
            email: "user@example.com",
            role: "user",
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: { auth: any; request: { nextUrl: URL } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnApprove = nextUrl.pathname.startsWith("/dashboard/approve");
      
      if (isOnApprove) {
        // Проверяем роль пользователя для страницы согласования
        return isLoggedIn && auth.user.role === "director";
      }
      
      if (isOnDashboard) {
        return isLoggedIn;
      }
      
      return true;
    },
  },
}; 