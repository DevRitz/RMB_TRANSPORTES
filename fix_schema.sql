-- Script de migração para corrigir schema do banco de dados
-- Execute: docker compose exec -T db mysql -u rmb_user -prmb_password_2024 rmb_transportes < fix_schema.sql

-- ATENÇÃO: Este script vai RECRIAR as tabelas e PERDER todos os dados!
-- Se você tem dados importantes, faça backup primeiro:
-- docker compose exec db mysqldump -u rmb_user -prmb_password_2024 rmb_transportes > backup.sql

-- Remover tabelas antigas
DROP TABLE IF EXISTS other_expenses;
DROP TABLE IF EXISTS maintenance_expenses;
DROP TABLE IF EXISTS driver_expenses;
DROP TABLE IF EXISTS fuel_expenses;
DROP TABLE IF EXISTS revenues;
DROP TABLE IF EXISTS trucks;
DROP TABLE IF EXISTS users;

-- Recriar com schema correto

-- Tabela de caminhões
CREATE TABLE trucks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plate VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de receitas
CREATE TABLE revenues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  truck_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  revenue_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (truck_id) REFERENCES trucks(id) ON DELETE CASCADE
);

-- Tabela de despesas com combustível
CREATE TABLE fuel_expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  truck_id INT NOT NULL,
  liters DECIMAL(10, 2) NOT NULL,
  price_per_liter DECIMAL(10, 2) NOT NULL,
  mileage INT NOT NULL,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (truck_id) REFERENCES trucks(id) ON DELETE CASCADE
);

-- Tabela de despesas com motorista
CREATE TABLE driver_expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  truck_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (truck_id) REFERENCES trucks(id) ON DELETE CASCADE
);

-- Tabela de despesas com manutenção
CREATE TABLE maintenance_expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  truck_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  mileage INT,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (truck_id) REFERENCES trucks(id) ON DELETE CASCADE
);

-- Tabela de outras despesas (não vinculadas a caminhão)
CREATE TABLE other_expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  supplier VARCHAR(255),
  document VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de usuários
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
