-- Limpiar datos existentes manteniendo la estructura
DELETE FROM product_images;
DELETE FROM product_features;
DELETE FROM products;
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
('Admin', 'Usuario', 'admin@example.com', '$2a$10$AbssHoRQ/hzhA8AMQhBNmOJrIv0IjCN37yfgwswElC.C7xpPE1eCu', true),
('Cliente', 'Regular', 'cliente@example.com', '$2a$10$AbssHoRQ/hzhA8AMQhBNmOJrIv0IjCN37yfgwswElC.C7xpPE1eCu', false);

-- Insertar productos con sus categorías y precios (usamos los IDs recién generados)
INSERT INTO products (name, description, category_id, price) 
SELECT 'Toyota Corolla', 'Sedán confortable para toda la familia. Equipado con transmisión automática, aire acondicionado y sistema de entretenimiento con pantalla táctil.', id, 50.00 FROM categories WHERE name = 'Sedán';

INSERT INTO products (name, description, category_id, price) 
SELECT 'Honda CR-V', 'SUV espacioso y económico. Ideal para viajes familiares y aventuras urbanas. Equipado con sistema de navegación, cámara de retroceso y sensores de proximidad.', id, 70.00 FROM categories WHERE name = 'SUV';

INSERT INTO products (name, description, category_id, price) 
SELECT 'Ford Ranger', 'Camioneta 4x4 resistente para todo tipo de terreno. Potente, espaciosa y con capacidad para cargas pesadas.', id, 90.00 FROM categories WHERE name = 'Camioneta';

INSERT INTO products (name, description, category_id, price) 
SELECT 'Volkswagen Golf', 'Compacto ágil y económico, perfecto para la ciudad. Ofrece un manejo excepcional y bajo consumo de combustible.', id, 45.00 FROM categories WHERE name = 'Compacto';

INSERT INTO products (name, description, category_id, price) 
SELECT 'Ford Mustang', 'Deportivo con gran potencia y diseño icónico. Motor V8 de alto rendimiento y sistema de sonido premium.', id, 120.00 FROM categories WHERE name = 'Deportivo';

INSERT INTO products (name, description, category_id, price) 
SELECT 'BMW Serie 3', 'Lujo y rendimiento en un solo auto. Interior de alta calidad, tecnología de punta y prestaciones deportivas.', id, 150.00 FROM categories WHERE name = 'Lujo';

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