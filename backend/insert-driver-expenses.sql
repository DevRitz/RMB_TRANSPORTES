-- Inserir despesas de motoristas de dezembro/2025

-- Primeiro, vamos criar uma tabela temporária para mapear placas para IDs
CREATE TEMPORARY TABLE IF NOT EXISTS plate_mapping AS
SELECT id, plate FROM trucks;

-- Mostrar mapeamento de placas
SELECT 'Mapeamento de placas para IDs:' as info;
SELECT id, plate FROM plate_mapping ORDER BY plate;

-- Inserir todas as despesas (usando subquery para buscar truck_id pela placa)
INSERT INTO driver_expenses (truck_id, amount, description, expense_date) VALUES
-- 09/12/2025
((SELECT id FROM trucks WHERE plate = 'GGU-5089'), 170.00, 'DIARIA VALDECIR', '2025-12-09'),
((SELECT id FROM trucks WHERE plate = 'OUP-5181'), 170.00, 'DIARIA GENIVALDO', '2025-12-09'),
((SELECT id FROM trucks WHERE plate = 'SUM-2111'), 200.00, 'DIARIA CRISTIANO', '2025-12-09'),
((SELECT id FROM trucks WHERE plate = 'SVJ-6600'), 170.00, 'DIARIA VILMAR', '2025-12-09'),
((SELECT id FROM trucks WHERE plate = 'SSR-4A93'), 170.00, 'DIARIA CLEBER', '2025-12-09'),
((SELECT id FROM trucks WHERE plate = 'SUU-0894'), 170.00, 'DIARIA CELIO', '2025-12-09'),
((SELECT id FROM trucks WHERE plate = 'TJU-2D88'), 170.00, 'DIARIA VINICIUS', '2025-12-09'),
((SELECT id FROM trucks WHERE plate = 'QSS-5C73'), 170.00, 'DIARIA EDUARDO', '2025-12-09'),
((SELECT id FROM trucks WHERE plate = 'UFA-9H88'), 170.00, 'DIARIA JAPA', '2025-12-09'),

-- 08/12/2025
((SELECT id FROM trucks WHERE plate = 'SUM-2111'), 170.00, 'DIARIA CRISTIANO', '2025-12-08'),
((SELECT id FROM trucks WHERE plate = 'SVJ-6600'), 170.00, 'DIARIA VILMAR', '2025-12-08'),
((SELECT id FROM trucks WHERE plate = 'TJU-2D88'), 200.00, 'DIARIA VINICIUS', '2025-12-08'),
((SELECT id FROM trucks WHERE plate = 'SUU-0894'), 170.00, 'DIARIA CELIO', '2025-12-08'),
((SELECT id FROM trucks WHERE plate = 'QSS-5C73'), 200.00, 'DIARIA EDUARDO', '2025-12-08'),
((SELECT id FROM trucks WHERE plate = 'UFA-9H88'), 200.00, 'DIARIA JAPA', '2025-12-08'),

-- 05/12/2025
((SELECT id FROM trucks WHERE plate = 'GGU-5089'), 95.00, 'DIARIA VALDECIR', '2025-12-05'),
((SELECT id FROM trucks WHERE plate = 'OUP-5181'), 170.00, 'DIARIA GENIVALDO', '2025-12-05'),
((SELECT id FROM trucks WHERE plate = 'SUM-2111'), 170.00, 'DIARIA CRISTIANO', '2025-12-05'),
((SELECT id FROM trucks WHERE plate = 'SVJ-6600'), 170.00, 'DIARIA VILMAR', '2025-12-05'),
((SELECT id FROM trucks WHERE plate = 'SSR-4A93'), 170.00, 'DIARIA CLEBER', '2025-12-05'),
((SELECT id FROM trucks WHERE plate = 'SUU-0894'), 170.00, 'DIARIA CELIO', '2025-12-05'),
((SELECT id FROM trucks WHERE plate = 'TJU-2D88'), 170.00, 'DIARIA VINICIUS', '2025-12-05'),
((SELECT id FROM trucks WHERE plate = 'QSS-5C73'), 200.00, 'DIARIA EDUARDO', '2025-12-05'),
((SELECT id FROM trucks WHERE plate = 'UFA-9H88'), 200.00, 'DIARIA JAPA', '2025-12-05'),

-- 04/12/2025
((SELECT id FROM trucks WHERE plate = 'GGU-5089'), 95.00, 'DIARIA VALDECIR', '2025-12-04'),
((SELECT id FROM trucks WHERE plate = 'OUP-5181'), 170.00, 'DIARIA GENIVALDO', '2025-12-04'),
((SELECT id FROM trucks WHERE plate = 'SUM-2111'), 200.00, 'DIARIA CRISTIANO', '2025-12-04'),
((SELECT id FROM trucks WHERE plate = 'SVJ-6600'), 200.00, 'DIARIA VILMAR', '2025-12-04'),
((SELECT id FROM trucks WHERE plate = 'SSR-4A93'), 200.00, 'DIARIA CLEBER', '2025-12-04'),
((SELECT id FROM trucks WHERE plate = 'SUU-0894'), 200.00, 'DIARIA CELIO', '2025-12-04'),
((SELECT id FROM trucks WHERE plate = 'TJU-2D88'), 170.00, 'DIARIA VINICIUS', '2025-12-04'),
((SELECT id FROM trucks WHERE plate = 'QSS-5C73'), 170.00, 'DIARIA EDUARDO', '2025-12-04'),
((SELECT id FROM trucks WHERE plate = 'UFA-9H88'), 200.00, 'DIARIA JAPA', '2025-12-04'),

-- 03/12/2025
((SELECT id FROM trucks WHERE plate = 'GGU-5089'), 170.00, 'DIARIA VALDECIR', '2025-12-03'),
((SELECT id FROM trucks WHERE plate = 'FAC-8896'), 90.00, 'PERNOITE LUCAS', '2025-12-03'),
((SELECT id FROM trucks WHERE plate = 'OUP-5181'), 170.00, 'DIARIA GENIVALDO', '2025-12-03'),
((SELECT id FROM trucks WHERE plate = 'SUM-2111'), 170.00, 'DIARIA CRISTIANO', '2025-12-03'),
((SELECT id FROM trucks WHERE plate = 'SVJ-6600'), 90.00, 'PERNOITE VILMAR', '2025-12-03'),
((SELECT id FROM trucks WHERE plate = 'SSR-4A93'), 170.00, 'DIARIA CLEBER', '2025-12-03'),
((SELECT id FROM trucks WHERE plate = 'SUU-0894'), 200.00, 'DIARIA CELIO', '2025-12-03'),
((SELECT id FROM trucks WHERE plate = 'TJU-2D88'), 170.00, 'DIARIA VINICIUS', '2025-12-03'),
((SELECT id FROM trucks WHERE plate = 'QSS-5C73'), 200.00, 'DIARIA EDUARDO', '2025-12-03'),
((SELECT id FROM trucks WHERE plate = 'UFA-9H88'), 200.00, 'DIARIA JAPA', '2025-12-03'),

-- 02/12/2025
((SELECT id FROM trucks WHERE plate = 'GGU-5089'), 170.00, 'DIARIA VALDECIR', '2025-12-02'),
((SELECT id FROM trucks WHERE plate = 'FAC-8896'), 170.00, 'DIARIA LUCAS', '2025-12-02'),
((SELECT id FROM trucks WHERE plate = 'SUM-2111'), 200.00, 'DIARIA CRISTIANO', '2025-12-02'),
((SELECT id FROM trucks WHERE plate = 'SVJ-6600'), 170.00, 'DIARIA VILMAR', '2025-12-02'),
((SELECT id FROM trucks WHERE plate = 'SSR-4A93'), 170.00, 'DIARIA CLEBER', '2025-12-02'),
((SELECT id FROM trucks WHERE plate = 'SUU-0894'), 170.00, 'DIARIA CELIO', '2025-12-02'),
((SELECT id FROM trucks WHERE plate = 'TJU-2D88'), 170.00, 'DIARIA VINICIUS', '2025-12-02'),
((SELECT id FROM trucks WHERE plate = 'QSS-5C73'), 200.00, 'DIARIA EDUARDO', '2025-12-02'),
((SELECT id FROM trucks WHERE plate = 'UFA-9H88'), 200.00, 'DIARIA JAPA', '2025-12-02'),

-- 01/12/2025
((SELECT id FROM trucks WHERE plate = 'SUM-2111'), 170.00, 'DIARIA CRISTIANO', '2025-12-01'),
((SELECT id FROM trucks WHERE plate = 'SVJ-6600'), 170.00, 'DIARIA VILMAR', '2025-12-01'),
((SELECT id FROM trucks WHERE plate = 'SSR-4A93'), 170.00, 'DIARIA VALDECIR', '2025-12-01'),
((SELECT id FROM trucks WHERE plate = 'TJU-2D88'), 170.00, 'DIARIA VINICIUS', '2025-12-01'),
((SELECT id FROM trucks WHERE plate = 'UFA-9H88'), 170.00, 'DIARIA JAPA', '2025-12-01'),
((SELECT id FROM trucks WHERE plate = 'QSS-5C73'), 200.00, 'DIARIA EDUARDO', '2025-12-01');

-- Mostrar resumo
SELECT '✅ DESPESAS INSERIDAS COM SUCESSO!' as resultado;
SELECT COUNT(*) as total_inserido, 
       SUM(amount) as valor_total,
       MIN(expense_date) as primeira_data,
       MAX(expense_date) as ultima_data
FROM driver_expenses;

-- Mostrar últimas 10 despesas inseridas
SELECT 'Últimas 10 despesas inseridas:' as info;
SELECT de.id, t.plate, de.description, de.amount, de.expense_date
FROM driver_expenses de
JOIN trucks t ON de.truck_id = t.id
ORDER BY de.created_at DESC
LIMIT 10;
