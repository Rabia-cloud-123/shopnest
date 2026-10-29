CREATE TABLE products (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  price integer NOT NULL CHECK (price >= 0),
  image_url text NOT NULL,
  stock_quantity integer NOT NULL CHECK (stock_quantity >= 0),
  department text NOT NULL CHECK (department IN ('men', 'women')),
  fabric text NOT NULL,
  sizes text[] NOT NULL,
  sort_order integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id uuid PRIMARY KEY,
  reference text NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address_line text NOT NULL,
  city text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL,
  status text NOT NULL DEFAULT 'placed' CHECK (status IN ('placed')),
  payment_method text NOT NULL DEFAULT 'cash_on_delivery' CHECK (payment_method = 'cash_on_delivery'),
  total integer NOT NULL CHECK (total >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id uuid PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  size text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price integer NOT NULL CHECK (unit_price >= 0),
  line_total integer NOT NULL CHECK (line_total >= 0)
);

CREATE INDEX order_items_order_id_idx ON order_items (order_id);
CREATE INDEX orders_created_at_idx ON orders (created_at DESC);
