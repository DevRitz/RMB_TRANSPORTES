-- Inserir abastecimentos de dezembro/2025

-- Mostrar mapeamento de placas
SELECT 'Mapeamento de placas para IDs:' as info;
SELECT id, plate FROM trucks ORDER BY plate;

-- Inserir todos os abastecimentos
INSERT INTO fuel_expenses (truck_id, liters, price_per_liter, mileage, expense_date) VALUES
-- 09/12/2025
((SELECT id FROM trucks WHERE plate = 'SUM-2111'), 14.70, 5.59, 249029, '2025-12-09'),

-- 08/12/2025
((SELECT id FROM trucks WHERE plate = 'UFA-9H88'), 133.10, 5.59, 9549, '2025-12-08'),
((SELECT id FROM trucks WHERE plate = 'QSS-5C73'), 148.00, 5.59, 18291, '2025-12-08'),
((SELECT id FROM trucks WHERE plate = 'TJU-2D88'), 127.80, 5.59, 91645, '2025-12-08'),
((SELECT id FROM trucks WHERE plate = 'SUU-0894'), 142.20, 5.59, 130057, '2025-12-08'),
((SELECT id FROM trucks WHERE plate = 'SVJ-6600'), 50.00, 5.59, 210521, '2025-12-08'),

-- 06/12/2025
((SELECT id FROM trucks WHERE plate = 'QSS-5C73'), 142.90, 5.59, 17555, '2025-12-06'),
((SELECT id FROM trucks WHERE plate = 'SSR-4A93'), 61.00, 5.59, 181808, '2025-12-06'),
((SELECT id FROM trucks WHERE plate = 'GGU-5089'), 28.00, 5.59, 632430, '2025-12-06'),

-- 05/12/2025
((SELECT id FROM trucks WHERE plate = 'UFA-9H88'), 128.90, 5.59, 6842, '2025-12-05'),
((SELECT id FROM trucks WHERE plate = 'QSS-5C73'), 57.00, 5.59, 16810, '2025-12-05'),
((SELECT id FROM trucks WHERE plate = 'OUP-5181'), 101.10, 5.59, 728561, '2025-12-05'),
((SELECT id FROM trucks WHERE plate = 'TJU-2D88'), 137.30, 5.59, 90953, '2025-12-05'),
((SELECT id FROM trucks WHERE plate = 'SUU-0894'), 80.90, 5.59, 129333, '2025-12-05'),
((SELECT id FROM trucks WHERE plate = 'SVJ-6600'), 97.00, 5.59, 210256, '2025-12-05'),
((SELECT id FROM trucks WHERE plate = 'SUM-2111'), 110.00, 5.59, 240866, '2025-12-05'),

-- 04/12/2025
((SELECT id FROM trucks WHERE plate = 'GGU-5089'), 66.00, 5.59, 632297, '2025-12-04'),
((SELECT id FROM trucks WHERE plate = 'UFA-9H88'), 143.13, 5.59, 8156, '2025-12-04'),
((SELECT id FROM trucks WHERE plate = 'QSS-5C73'), 143.00, 5.59, 16608, '2025-12-04'),
((SELECT id FROM trucks WHERE plate = 'TJU-2D88'), 136.60, 5.59, 90234, '2025-12-04'),
((SELECT id FROM trucks WHERE plate = 'SUU-0894'), 133.20, 5.59, 129828, '2025-12-04'),
((SELECT id FROM trucks WHERE plate = 'SSR-4A93'), 155.00, 5.59, 181619, '2025-12-04'),
((SELECT id FROM trucks WHERE plate = 'SUM-2111'), 135.40, 5.59, 240301, '2025-12-04'),

-- 04/12/2025 (segundo abastecimento)
((SELECT id FROM trucks WHERE plate = 'GGU-5089'), 109.00, 5.59, 631993, '2025-12-04'),

-- 03/12/2025
((SELECT id FROM trucks WHERE plate = 'UFA-9H88'), 122.70, 5.59, 7433, '2025-12-03'),
((SELECT id FROM trucks WHERE plate = 'OUP-5181'), 87.30, 5.59, 728155, '2025-12-03'),
((SELECT id FROM trucks WHERE plate = 'TJU-2D88'), 138.60, 5.59, 89549, '2025-12-03'),
((SELECT id FROM trucks WHERE plate = 'SUU-0894'), 146.60, 5.59, 128185, '2025-12-03'),
((SELECT id FROM trucks WHERE plate = 'SSR-4A93'), 69.40, 5.59, 180093, '2025-12-03'),
((SELECT id FROM trucks WHERE plate = 'SVJ-6600'), 57.00, 5.59, 209065, '2025-12-03'),
((SELECT id FROM trucks WHERE plate = 'SUM-2111'), 67.60, 5.59, 239497, '2025-12-03'),

-- 03/12/2025 (segundo abastecimento)
((SELECT id FROM trucks WHERE plate = 'GGU-5089'), 71.00, 5.59, 631504, '2025-12-03'),

-- 02/12/2025
((SELECT id FROM trucks WHERE plate = 'UFA-9H88'), 138.90, 5.59, 6760, '2025-12-02'),
((SELECT id FROM trucks WHERE plate = 'SUU-0894'), 139.60, 5.59, 127442, '2025-12-02'),
((SELECT id FROM trucks WHERE plate = 'SUM-2111'), 139.90, 5.59, 239195, '2025-12-02'),
((SELECT id FROM trucks WHERE plate = 'QSS-5C73'), 129.20, 5.59, 15846, '2025-12-02'),
((SELECT id FROM trucks WHERE plate = 'FAC-8896'), 56.30, 5.59, 712450, '2025-12-02'),
((SELECT id FROM trucks WHERE plate = 'TJU-2D88'), 137.60, 5.59, 88642, '2025-12-02'),
((SELECT id FROM trucks WHERE plate = 'SSR-4A93'), 139.40, 5.59, 180566, '2025-12-02'),

-- 01/12/2025
((SELECT id FROM trucks WHERE plate = 'UFA-9H88'), 143.50, 5.59, 6072, '2025-12-01'),
((SELECT id FROM trucks WHERE plate = 'QSS-5C73'), 144.00, 5.56, 15140, '2025-12-01'),
((SELECT id FROM trucks WHERE plate = 'OUP-5181'), 10.60, 5.56, 727700, '2025-12-01'),
((SELECT id FROM trucks WHERE plate = 'TJU-2D88'), 141.20, 5.56, 88138, '2025-12-01'),
((SELECT id FROM trucks WHERE plate = 'SSR-4A93'), 54.80, 5.56, 179801, '2025-12-01'),
((SELECT id FROM trucks WHERE plate = 'SVJ-6600'), 115.00, 5.59, 208874, '2025-12-01');

-- Mostrar resumo
SELECT '✅ ABASTECIMENTOS INSERIDOS COM SUCESSO!' as resultado;
SELECT COUNT(*) as total_inserido, 
       SUM(liters) as total_litros,
       SUM(liters * price_per_liter) as valor_total,
       AVG(price_per_liter) as preco_medio_litro,
       MIN(expense_date) as primeira_data,
       MAX(expense_date) as ultima_data
FROM fuel_expenses;

-- Mostrar últimas 10 abastecimentos inseridos
SELECT 'Últimas 10 abastecimentos inseridos:' as info;
SELECT fe.id, t.plate, fe.liters, fe.price_per_liter, 
       ROUND(fe.liters * fe.price_per_liter, 2) as total,
       fe.mileage, fe.expense_date
FROM fuel_expenses fe
JOIN trucks t ON fe.truck_id = t.id
ORDER BY fe.created_at DESC
LIMIT 10;
