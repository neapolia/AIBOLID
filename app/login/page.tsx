"use client";
import { signIn } from "next-auth/react"; // Импортируем функцию для входа
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Функция для отправки данных формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", {
      username,
      password,
      callbackUrl: "/", // Перенаправление после успешного входа
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 max-w-sm mx-auto">
      <h2 className="text-xl font-bold">Вход</h2>
      <input
        type="text"
        placeholder="Логин"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2"
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Войти
      </button>
    </form>
  );
}
