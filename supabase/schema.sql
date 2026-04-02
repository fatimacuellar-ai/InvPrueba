-- =============================================
-- SCHEMA: Inventory Dashboard by Branch
-- =============================================

-- 1. SUCURSALES TABLE
CREATE TABLE IF NOT EXISTS sucursales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  direccion TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTOS TABLE
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('Electrónica', 'Ropa', 'Alimentos', 'Herramientas')),
  stock INTEGER NOT NULL DEFAULT 0,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 5,
  sucursal_id UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  sucursal_id UUID REFERENCES sucursales(id),
  rol TEXT NOT NULL DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- SUCURSALES POLICIES
CREATE POLICY "Admins can view all sucursales" ON sucursales
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.rol = 'admin'
    )
  );

CREATE POLICY "Users can view own sucursal" ON sucursales
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.sucursal_id = sucursales.id
    )
  );

-- PRODUCTOS POLICIES
CREATE POLICY "Admins can view all productos" ON productos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.rol = 'admin'
    )
  );

CREATE POLICY "Users can view own sucursal productos" ON productos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.sucursal_id = productos.sucursal_id
    )
  );

CREATE POLICY "Admins can insert productos" ON productos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.rol = 'admin'
    )
  );

CREATE POLICY "Admins can update productos" ON productos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.rol = 'admin'
    )
  );

-- =============================================
-- TRIGGER: Auto-create profile on signup
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, rol)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email), 'usuario');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert sucursales
INSERT INTO sucursales (id, nombre, ciudad, direccion) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sucursal Norte', 'Monterrey', 'Av. Constitución 1234, Col. Centro'),
  ('22222222-2222-2222-2222-222222222222', 'Sucursal Centro', 'Ciudad de México', 'Paseo de la Reforma 567, Col. Juárez'),
  ('33333333-3333-3333-3333-333333333333', 'Sucursal Sur', 'Guadalajara', 'Av. López Mateos 890, Col. Chapalita')
ON CONFLICT (id) DO NOTHING;

-- Insert productos (20 products across 3 branches, 4 categories)
INSERT INTO productos (nombre, categoria, stock, precio, stock_minimo, sucursal_id) VALUES
  -- Sucursal Norte
  ('Laptop HP Pavilion', 'Electrónica', 15, 12500.00, 5, '11111111-1111-1111-1111-111111111111'),
  ('Mouse Inalámbrico', 'Electrónica', 45, 350.00, 10, '11111111-1111-1111-1111-111111111111'),
  ('Playera Polo Hombre', 'Ropa', 80, 299.00, 20, '11111111-1111-1111-1111-111111111111'),
  ('Jeans Mujer Slim', 'Ropa', 3, 599.00, 15, '11111111-1111-1111-1111-111111111111'),
  ('Arroz 5kg', 'Alimentos', 200, 89.00, 50, '11111111-1111-1111-1111-111111111111'),
  ('Aceite de Oliva 1L', 'Alimentos', 4, 120.00, 20, '11111111-1111-1111-1111-111111111111'),
  ('Taladro Inalámbrico', 'Herramientas', 12, 1800.00, 5, '11111111-1111-1111-1111-111111111111'),
  ('Martillo 500g', 'Herramientas', 2, 180.00, 10, '11111111-1111-1111-1111-111111111111'),
  -- Sucursal Centro
  ('Tablet Samsung A8', 'Electrónica', 22, 5800.00, 8, '22222222-2222-2222-2222-222222222222'),
  ('Auriculares Bluetooth', 'Electrónica', 35, 850.00, 10, '22222222-2222-2222-2222-222222222222'),
  ('Camisa Formal Hombre', 'Ropa', 60, 450.00, 15, '22222222-2222-2222-2222-222222222222'),
  ('Vestido Casual Mujer', 'Ropa', 3, 799.00, 10, '22222222-2222-2222-2222-222222222222'),
  ('Pasta 500g', 'Alimentos', 150, 25.00, 40, '22222222-2222-2222-2222-222222222222'),
  ('Café Molido 250g', 'Alimentos', 75, 95.00, 20, '22222222-2222-2222-2222-222222222222'),
  ('Destornillador Set 12pz', 'Herramientas', 18, 350.00, 5, '22222222-2222-2222-2222-222222222222'),
  -- Sucursal Sur
  ('Monitor LED 24"', 'Electrónica', 8, 3200.00, 3, '33333333-3333-3333-3333-333333333333'),
  ('Teclado Mecánico', 'Electrónica', 2, 1200.00, 5, '33333333-3333-3333-3333-333333333333'),
  ('Sudadera Unisex', 'Ropa', 90, 399.00, 25, '33333333-3333-3333-3333-333333333333'),
  ('Atún en lata 120g', 'Alimentos', 300, 22.00, 80, '33333333-3333-3333-3333-333333333333'),
  ('Llave Inglesa 12"', 'Herramientas', 3, 220.00, 8, '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;
