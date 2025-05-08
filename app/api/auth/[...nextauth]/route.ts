import NextAuth from "next-auth";
import { authOptions } from "@/app/auth";

// Явно указываем использование Node.js runtime
export const runtime = 'nodejs';

// Создаем обработчик для NextAuth
const handler = NextAuth(authOptions);

// Экспортируем обработчики для GET и POST запросов
export { handler as GET, handler as POST }; 