import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

const sql = postgres(process.env.POSTGRES_URL!);

export async function runMigrations() {
  try {
    console.log('Starting migrations...');
    
    // Получаем список файлов миграций
    const migrationsDir = path.join(process.cwd(), 'app/lib/migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    // Создаем таблицу для отслеживания миграций
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Выполняем каждую миграцию
    for (const file of files) {
      const migrationName = file;
      
      // Проверяем, была ли миграция уже выполнена
      const executed = await sql`
        SELECT 1 FROM migrations WHERE name = ${migrationName}
      `;
      
      if (executed.length === 0) {
        console.log(`Running migration: ${migrationName}`);
        
        // Читаем и выполняем SQL из файла
        const sqlContent = fs.readFileSync(
          path.join(migrationsDir, file),
          'utf8'
        );
        
        await sql.unsafe(sqlContent);
        
        // Отмечаем миграцию как выполненную
        await sql`
          INSERT INTO migrations (name) VALUES (${migrationName})
        `;
        
        console.log(`Migration ${migrationName} completed`);
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

// Запускаем миграции
runMigrations().catch(console.error); 