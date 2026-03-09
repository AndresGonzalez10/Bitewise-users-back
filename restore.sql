-- 0. LIMPIEZA PROFUNDA (Para no tener errores de tablas duplicadas)
DROP TABLE IF EXISTS purchase_history, shopping_list_items, shopping_lists, recipe_ingredients, recipes, inventory, ingredients, users CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Usuarios (CORREGIDO: Ahora usa "password" para coincidir con tu código)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(20) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'cliente',
    weekly_budget DECIMAL(10,2) DEFAULT 0, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ingredientes 
CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE, 
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10,4) NOT NULL DEFAULT 0,
    unit_default VARCHAR(10) NOT NULL DEFAULT 'g',
    weight_per_unit DECIMAL(10,2) NOT NULL DEFAULT 1.00
);

-- 3. Inventario del Usuario 
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id),
    current_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, ingredient_id)
);

-- 4. Recetas 
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    instructions TEXT NOT NULL,
    image_url TEXT,
    is_custom BOOLEAN DEFAULT false,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    servings VARCHAR(10) DEFAULT '1-2',  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Ingredientes de una receta
CREATE TABLE recipe_ingredients (
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id),
    required_quantity DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (recipe_id, ingredient_id)
);

-- 6. Listas de Compras
CREATE TABLE shopping_lists (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Items de la Lista 
CREATE TABLE shopping_list_items (
    id SERIAL PRIMARY KEY,
    list_id INTEGER REFERENCES shopping_lists(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id),
    target_quantity DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0 
);

-- 8. NUEVO: Historial de Compras 
CREATE TABLE purchase_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_cost DECIMAL(10,2) NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1. INGREDIENTES INVESTIGADOS CON PESO UNITARIO
INSERT INTO ingredients (name, category, unit_price, unit_default, weight_per_unit) VALUES
('Tomate', 'Verduras', 0.0300, 'g', 120.00),
('Cebolla', 'Verduras', 0.0190, 'g', 150.00),
('Ajo', 'Verduras', 0.1200, 'g', 10.00),
('Limón', 'Verduras', 0.0700, 'g', 60.00),
('Chile', 'Verduras', 0.0420, 'g', 15.00),
('Papa', 'Verduras', 0.0400, 'g', 180.00),
('Pechuga de Pollo', 'Proteínas', 0.1450, 'g', 200.00),
('Huevo Blanco', 'Proteínas', 0.0660, 'g', 57.00),
('Atún en lata', 'Proteínas', 0.2230, 'g', 140.00),
('Arroz Súper Extra', 'Cereales', 0.0380, 'g', 1.00),
('Frijol Negro', 'Leguminosas', 0.0450, 'g', 1.00),
('Pasta Espagueti', 'Cereales', 0.0460, 'g', 1.00),
('Queso Oaxaca', 'Lácteos', 0.1600, 'g', 1.00),
('Leche Entera', 'Lácteos', 0.0370, 'ml', 1000.00),
('Aceite Vegetal', 'Abarrotes', 0.0450, 'ml', 15.00);

-- 2. RECETAS
INSERT INTO recipes (title, instructions) VALUES 
('Huevos a la Mexicana', '1. Picar tomate, cebolla y chile. 2. Sofreír en aceite. 3. Agregar los huevos y revolver.'),
('Arroz con Pollo', '1. Hervir la pechuga. 2. Sofreír el arroz. 3. Cocer todo junto con caldo de pollo.'),
('Ensalada Fresca de Atún', '1. Drenar el atún. 2. Picar finamente la cebolla y el tomate. 3. Mezclar todo con el jugo de limón y un toque de chile picado.'),
('Espagueti con Pollo al Ajillo', '1. Hervir la pasta hasta que esté al dente. 2. Picar el ajo finamente y sofreírlo en aceite junto con la pechuga cortada en cubos. 3. Mezclar la pasta con el pollo y agregar queso Oaxaca deshebrado por encima.');

-- 3. INGREDIENTES DE RECETAS

-- Receta 1: Huevos a la Mexicana
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, required_quantity) VALUES
(1, 8, 114.00), (1, 1, 120.00), (1, 2, 75.00), (1, 5, 15.00), (1, 15, 15.00); 

-- Receta 2: Arroz con Pollo
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, required_quantity) VALUES
(2, 7, 400.00), (2, 10, 150.00), (2, 2, 50.00), (2, 15, 15.00); 

-- Receta 3: Ensalada Fresca de Atún
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, required_quantity) VALUES
(3, 9, 140.00), (3, 1, 120.00), (3, 2, 50.00), (3, 4, 30.00), (3, 5, 15.00); 

-- Receta 4: Espagueti con Pollo al Ajillo
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, required_quantity) VALUES
(4, 12, 200.00), (4, 3, 10.00), (4, 7, 200.00), (4, 15, 15.00), (4, 13, 50.00); 

-- 1. TRIGGER: Auto-cálculo de precio en la Lista de Compras
CREATE OR REPLACE FUNCTION calculate_shopping_item_price() RETURNS TRIGGER AS $$
DECLARE ing_price DECIMAL(10,4);
BEGIN
    SELECT unit_price INTO ing_price FROM ingredients WHERE id = NEW.ingredient_id;
    IF ing_price IS NULL THEN ing_price := 0; END IF;
    NEW.total_price := NEW.target_quantity * ing_price;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_shopping_item_price BEFORE INSERT OR UPDATE ON shopping_list_items
FOR EACH ROW EXECUTE FUNCTION calculate_shopping_item_price();

-- 2. TRIGGER: Limpieza Automática del Inventario (Refri)
CREATE OR REPLACE FUNCTION clean_empty_inventory() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_quantity <= 0 THEN DELETE FROM inventory WHERE id = NEW.id; END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clean_empty_inventory AFTER UPDATE ON inventory
FOR EACH ROW EXECUTE FUNCTION clean_empty_inventory();