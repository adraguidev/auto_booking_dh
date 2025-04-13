-- Limpiar datos existentes manteniendo la estructura
DELETE FROM product_features;
DELETE FROM product_images;
DELETE FROM products;
DELETE FROM features;
DELETE FROM categories;
DELETE FROM users;

-- Insertar categorías
INSERT INTO categories (name) VALUES 
('Sedán'),
('SUV'),
('Camioneta'),
('Compacto'),
('Deportivo'),
('Lujo');

-- Insertar usuarios (contraseña: "password123" codificada con BCrypt)
INSERT INTO users (first_name, last_name, email, password, is_admin) VALUES 
('Admin', 'Usuario', 'admin@example.com', '$2a$10$LYGfuI/GKM5u8kgF5Q4t2eZi1GYM0zJAopxfUZFPBVvUQJJ/KmVKW', true),
('Cliente', 'Regular', 'cliente@example.com', '$2a$10$LYGfuI/GKM5u8kgF5Q4t2eZi1GYM0zJAopxfUZFPBVvUQJJ/KmVKW', false);

-- Insertar características (features)
INSERT INTO features (name, icon) VALUES
('Aire Acondicionado', '❄️'),
('Transmisión Automática', '🔄'),
('4x4', '🚙'),
('GPS Integrado', '🧭'),
('Bluetooth', '📱'),
('Asientos de Cuero', '💺'),
('Techo Solar', '☀️'),
('Cámara de Retroceso', '📷');

-- Insertar productos con sus categorías (usamos los IDs recién generados)
INSERT INTO products (name, description, category_id) 
SELECT 'Toyota Corolla', 'Sedán confortable para toda la familia. Equipado con transmisión automática, aire acondicionado y sistema de entretenimiento con pantalla táctil.', id FROM categories WHERE name = 'Sedán';

INSERT INTO products (name, description, category_id) 
SELECT 'Honda CR-V', 'SUV espacioso y económico. Ideal para viajes familiares y aventuras urbanas. Equipado con sistema de navegación, cámara de retroceso y sensores de proximidad.', id FROM categories WHERE name = 'SUV';

INSERT INTO products (name, description, category_id) 
SELECT 'Ford Ranger', 'Camioneta 4x4 resistente para todo tipo de terreno. Potente, espaciosa y con capacidad para cargas pesadas.', id FROM categories WHERE name = 'Camioneta';

INSERT INTO products (name, description, category_id) 
SELECT 'Volkswagen Golf', 'Compacto ágil y económico, perfecto para la ciudad. Ofrece un manejo excepcional y bajo consumo de combustible.', id FROM categories WHERE name = 'Compacto';

INSERT INTO products (name, description, category_id) 
SELECT 'Ford Mustang', 'Deportivo con gran potencia y diseño icónico. Motor V8 de alto rendimiento y sistema de sonido premium.', id FROM categories WHERE name = 'Deportivo';

INSERT INTO products (name, description, category_id) 
SELECT 'BMW Serie 3', 'Lujo y rendimiento en un solo auto. Interior de alta calidad, tecnología de punta y prestaciones deportivas.', id FROM categories WHERE name = 'Lujo';

-- Asociar características a productos
-- Toyota Corolla: Aire Acondicionado, Transmisión Automática, Bluetooth
INSERT INTO product_features (product_id, feature_id)
SELECT p.id, f.id FROM products p, features f
WHERE p.name = 'Toyota Corolla' AND f.name IN ('Aire Acondicionado', 'Transmisión Automática', 'Bluetooth');

-- Honda CR-V: Aire Acondicionado, GPS Integrado, Cámara de Retroceso, Bluetooth
INSERT INTO product_features (product_id, feature_id)
SELECT p.id, f.id FROM products p, features f
WHERE p.name = 'Honda CR-V' AND f.name IN ('Aire Acondicionado', 'GPS Integrado', 'Cámara de Retroceso', 'Bluetooth');

-- Ford Ranger: 4x4, Aire Acondicionado, Cámara de Retroceso
INSERT INTO product_features (product_id, feature_id)
SELECT p.id, f.id FROM products p, features f
WHERE p.name = 'Ford Ranger' AND f.name IN ('4x4', 'Aire Acondicionado', 'Cámara de Retroceso');

-- Volkswagen Golf: Aire Acondicionado, Bluetooth, Transmisión Automática
INSERT INTO product_features (product_id, feature_id)
SELECT p.id, f.id FROM products p, features f
WHERE p.name = 'Volkswagen Golf' AND f.name IN ('Aire Acondicionado', 'Bluetooth', 'Transmisión Automática');

-- Ford Mustang: Transmisión Automática, Aire Acondicionado, Asientos de Cuero, Bluetooth
INSERT INTO product_features (product_id, feature_id)
SELECT p.id, f.id FROM products p, features f
WHERE p.name = 'Ford Mustang' AND f.name IN ('Transmisión Automática', 'Aire Acondicionado', 'Asientos de Cuero', 'Bluetooth');

-- BMW Serie 3: Techo Solar, Asientos de Cuero, GPS Integrado, Bluetooth, Cámara de Retroceso, Aire Acondicionado
INSERT INTO product_features (product_id, feature_id)
SELECT p.id, f.id FROM products p, features f
WHERE p.name = 'BMW Serie 3' AND f.name IN ('Techo Solar', 'Asientos de Cuero', 'GPS Integrado', 'Bluetooth', 'Cámara de Retroceso', 'Aire Acondicionado');

-- Insertar imágenes para los productos (después de insertarlos)
INSERT INTO product_images (product_id, image)
SELECT p.id, 'https://www.toyota.com/imgix/responsive/images/mlp/colorizer/2023/corolla/1J9_01.png'
FROM products p WHERE p.name = 'Toyota Corolla';

INSERT INTO product_images (product_id, image)
SELECT p.id, 'https://www.toyota.com/imgix/responsive/images/mlp/colorizer/2023/corolla/1J9_02.png'
FROM products p WHERE p.name = 'Toyota Corolla';

INSERT INTO product_images (product_id, image)
SELECT p.id, 'https://www.honda.com/images/2023-CR-V-exterior-front.jpg'
FROM products p WHERE p.name = 'Honda CR-V';

INSERT INTO product_images (product_id, image)
SELECT p.id, 'https://www.honda.com/images/2023-CR-V-exterior-rear.jpg'
FROM products p WHERE p.name = 'Honda CR-V';

INSERT INTO product_images (product_id, image)
SELECT p.id, 'https://www.ford.com/cmslibs/content/dam/brand_ford/en_us/brand/trucks/ranger/2023/collections/equipment/3-2/23_FRD_RGR_47678_32.jpg'
FROM products p WHERE p.name = 'Ford Ranger';

INSERT INTO product_images (product_id, image)
SELECT p.id, 'https://www.ford.com/cmslibs/content/dam/brand_ford/en_us/brand/trucks/ranger/2023/collections/equipment/3-2/23_FRD_RGR_47677_32.jpg'
FROM products p WHERE p.name = 'Ford Ranger';

INSERT INTO product_images (product_id, image)
SELECT p.id, 'https://www.vw.com/content/dam/onehub_pkw/us/en/models/golf/golf-r-22/overview/VW_NGW6_Showroom_GolfR_Performance_02.jpg'
FROM products p WHERE p.name = 'Volkswagen Golf';

INSERT INTO product_images (product_id, image)
SELECT p.id, 'https://www.vw.com/content/dam/onehub_pkw/us/en/models/golf/golf-r-22/overview/VW_NGW6_Showroom_GolfR_Design_03.jpg'
FROM products p WHERE p.name = 'Volkswagen Golf';

INSERT INTO product_images (product_id, image)
SELECT p.id, 'https://www.ford.com/cmslibs/content/dam/brand_ford/en_us/brand/cars/mustang/2023/collections/equipment/3-2/23_FRD_MST_46303_32.jpg'
FROM products p WHERE p.name = 'Ford Mustang';

INSERT INTO product_images (product_id, image)
SELECT p.id, 'https://www.ford.com/cmslibs/content/dam/brand_ford/en_us/brand/cars/mustang/2023/collections/equipment/3-2/23_FRD_MST_46305_32.jpg'
FROM products p WHERE p.name = 'Ford Mustang';

INSERT INTO product_images (product_id, image)
SELECT p.id, 'https://www.bmw.com/content/dam/bmw/marketDE/bmw_com/categories/new-cars/3-series/2022/sedan/bmw-3-series-sedan-sp-desktop.jpg'
FROM products p WHERE p.name = 'BMW Serie 3';

INSERT INTO product_images (product_id, image)
SELECT p.id, 'https://www.bmw.com/content/dam/bmw/marketDE/bmw_com/categories/new-cars/3-series/2022/sedan/bmw-3-series-sedan-mc-product-highlight-desktop-01.jpg'
FROM products p WHERE p.name = 'BMW Serie 3'; 