-- Add purchase price and shipping cost columns to products
ALTER TABLE products
  ADD COLUMN purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Optional: add index for faster admin filtering
ALTER TABLE products ADD INDEX idx_products_name (name);
