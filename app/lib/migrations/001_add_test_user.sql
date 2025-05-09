-- Добавляем тестового пользователя
INSERT INTO polina_users (email, password_hash)
VALUES ('test@example.com', 'test123')
ON CONFLICT (email) DO NOTHING; 