-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'director');

-- Create users table
CREATE TABLE IF NOT EXISTS polina_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO polina_users (email, password_hash, role)
VALUES ('admin@aibolid.ru', '$2b$10$8K1p/a0dR1xqM8K3hQz1eOQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZ', 'admin');

-- Insert default director (password: director123)
INSERT INTO polina_users (email, password_hash, role)
VALUES ('director@aibolid.ru', '$2b$10$8K1p/a0dR1xqM8K3hQz1eOQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZ', 'director');

-- Add approved_by field to invoices table
ALTER TABLE polina_invoices 
ADD COLUMN approved_by UUID REFERENCES polina_users(id),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX idx_users_email ON polina_users(email);
CREATE INDEX idx_invoices_approved_by ON polina_invoices(approved_by); 