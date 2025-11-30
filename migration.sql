# Script de migração do banco de dados
# Execute este script no MySQL da VPS para adicionar as novas tabelas

USE seu_banco_de_dados; -- Substitua pelo nome do seu banco

-- 1. Criar tabela de usuários (se não existir)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Inserir usuário admin padrão (se não existir)
INSERT IGNORE INTO users (username, password, role)
VALUES ('admin', '$2a$10$YourHashedPasswordHere', 'admin');
-- NOTA: A senha será criada automaticamente pelo código Node.js quando o servidor iniciar

-- 3. Verificar se as outras tabelas existem (adicione novas colunas se necessário)
-- Exemplo: se você adicionou novas colunas em tabelas existentes

-- ALTER TABLE trucks ADD COLUMN IF NOT EXISTS nova_coluna VARCHAR(255);

-- 4. Verificar integridade
SELECT 'Migração concluída!' as status;
SELECT COUNT(*) as total_users FROM users;
