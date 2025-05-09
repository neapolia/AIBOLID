-- Create invoices table
CREATE TABLE IF NOT EXISTS polina_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivery_date TIMESTAMP WITH TIME ZONE,
    docs_url VARCHAR(255),
    status BOOLEAN DEFAULT false,
    payment_status BOOLEAN DEFAULT false,
    provider_id UUID REFERENCES polina_providers(id)
);

-- Create invoice products table
CREATE TABLE IF NOT EXISTS polina_invoices_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES polina_invoices(id),
    product_id UUID NOT NULL REFERENCES polina_products(id),
    count INTEGER NOT NULL
); 