-- Создание таблицы истории изменений склада
CREATE TABLE IF NOT EXISTS polina_storage_history (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    count INTEGER NOT NULL,
    invoice_id VARCHAR(255),
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('add', 'remove')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES polina_products(id),
    FOREIGN KEY (invoice_id) REFERENCES polina_invoices(id)
);

-- Добавление индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_storage_history_product_id ON polina_storage_history(product_id);
CREATE INDEX IF NOT EXISTS idx_storage_history_created_at ON polina_storage_history(created_at);

-- Добавление колонки is_auto_order в таблицу заказов
ALTER TABLE polina_invoices ADD COLUMN IF NOT EXISTS is_auto_order BOOLEAN DEFAULT FALSE; 