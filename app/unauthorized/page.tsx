export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          Доступ запрещен
        </h1>
        <p className="text-gray-600 mb-8">
          У вас нет прав для доступа к этой странице
        </p>
        <a
          href="/dashboard"
          className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Вернуться на главную
        </a>
      </div>
    </div>
  );
} 