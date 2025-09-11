# 🚀 Guia de Instalação - RMB Transportes

Este guia fornece instruções detalhadas para instalar e executar o sistema RMB Transportes em diferentes ambientes.

## 📋 Pré-requisitos

### Sistema Operacional
- Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- Windows 10+ (com WSL2 recomendado)
- macOS 10.15+

### Software Necessário
- **Node.js** versão 18.0 ou superior
- **MySQL** versão 8.0 ou superior
- **pnpm** (recomendado) ou npm/yarn

## 🔧 Instalação Passo a Passo

### 1. Preparação do Ambiente

#### Ubuntu/Debian
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar MySQL
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### CentOS/RHEL
```bash
# Instalar Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar MySQL
sudo yum install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

#### Windows (WSL2)
```bash
# Instalar Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Instalar pnpm
npm install -g pnpm

# Instalar MySQL
sudo apt update
sudo apt install -y mysql-server
sudo service mysql start
```

### 2. Configuração do MySQL

#### Configuração Inicial
```bash
# Executar configuração segura do MySQL
sudo mysql_secure_installation

# Responder as perguntas:
# - Validate password plugin: Y
# - Password strength: 2 (Strong)
# - Remove anonymous users: Y
# - Disallow root login remotely: Y
# - Remove test database: Y
# - Reload privilege tables: Y
```

#### Criar Banco e Usuário
```bash
# Conectar ao MySQL como root
sudo mysql -u root -p

# Executar comandos SQL:
CREATE DATABASE rmb_transportes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'rmb_user'@'localhost' IDENTIFIED BY 'rmb_password_123!';
GRANT ALL PRIVILEGES ON rmb_transportes.* TO 'rmb_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Importar Schema
```bash
# Navegar para o diretório do projeto
cd rmb-transportes-app

# Importar estrutura do banco
mysql -u rmb_user -p rmb_transportes < database_schema.sql
# Digite a senha: rmb_password_123!
```

### 3. Configuração do Backend

#### Instalar Dependências
```bash
# Navegar para o backend
cd backend

# Instalar dependências
npm install

# Verificar se todas as dependências foram instaladas
npm list
```

#### Configurar Variáveis de Ambiente
```bash
# Criar arquivo .env
cp .env.example .env

# Editar configurações
nano .env
```

Conteúdo do arquivo `.env`:
```env
# Configurações do Banco de Dados MySQL
DB_HOST=localhost
DB_USER=rmb_user
DB_PASSWORD=rmb_password_123!
DB_NAME=rmb_transportes

# Configurações do Servidor
PORT=5000
NODE_ENV=production

# Configurações de Segurança (opcional)
JWT_SECRET=seu_jwt_secret_aqui
CORS_ORIGIN=http://localhost:5173
```

#### Testar Backend
```bash
# Iniciar servidor
npm start

# Em outro terminal, testar API
curl http://localhost:5000/
# Deve retornar: {"message":"API RMB Transportes funcionando!"}

# Testar endpoint de caminhões
curl http://localhost:5000/api/trucks
# Deve retornar: []
```

### 4. Configuração do Frontend

#### Instalar Dependências
```bash
# Navegar para o frontend
cd ../frontend

# Instalar dependências
pnpm install

# Verificar instalação
pnpm list
```

#### Configurar API Base URL (se necessário)
```bash
# Editar arquivo de configuração da API
nano src/services/api.js

# Verificar se a baseURL está correta:
# baseURL: 'http://localhost:5000/api'
```

#### Testar Frontend
```bash
# Iniciar aplicação
pnpm run dev

# Acessar no navegador: http://localhost:5173
```

## 🔍 Verificação da Instalação

### 1. Verificar Serviços
```bash
# Verificar MySQL
sudo systemctl status mysql

# Verificar se o banco foi criado
mysql -u rmb_user -p -e "SHOW DATABASES;"

# Verificar tabelas
mysql -u rmb_user -p rmb_transportes -e "SHOW TABLES;"
```

### 2. Testar Funcionalidades

#### Backend
```bash
# Testar criação de caminhão
curl -X POST http://localhost:5000/api/trucks \
  -H "Content-Type: application/json" \
  -d '{"plate":"ABC-1234"}'

# Testar listagem
curl http://localhost:5000/api/trucks
```

#### Frontend
1. Acesse http://localhost:5173
2. Navegue para "Caminhões"
3. Clique em "Cadastrar Primeiro Caminhão"
4. Preencha uma placa (ex: ABC-1234)
5. Clique em "Cadastrar"
6. Verifique se o caminhão aparece na lista

## 🚀 Execução em Produção

### 1. Build do Frontend
```bash
cd frontend
pnpm run build

# Os arquivos serão gerados em dist/
```

### 2. Configurar Nginx (opcional)
```bash
# Instalar Nginx
sudo apt install -y nginx

# Configurar site
sudo nano /etc/nginx/sites-available/rmb-transportes
```

Configuração do Nginx:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    # Frontend
    location / {
        root /caminho/para/rmb-transportes-app/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API Backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Configurar PM2 (Process Manager)
```bash
# Instalar PM2
npm install -g pm2

# Iniciar backend com PM2
cd backend
pm2 start server.js --name "rmb-backend"

# Configurar auto-start
pm2 startup
pm2 save
```

## 🔧 Solução de Problemas

### Erro de Conexão com MySQL
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Reiniciar MySQL
sudo systemctl restart mysql

# Verificar logs
sudo tail -f /var/log/mysql/error.log
```

### Erro de Permissões
```bash
# Dar permissões corretas
sudo chown -R $USER:$USER rmb-transportes-app/
chmod -R 755 rmb-transportes-app/
```

### Porta já em uso
```bash
# Verificar processos na porta 5000
sudo lsof -i :5000

# Matar processo se necessário
sudo kill -9 PID_DO_PROCESSO
```

### Dependências não instaladas
```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

## 📊 Monitoramento

### Logs do Backend
```bash
# Ver logs em tempo real
pm2 logs rmb-backend

# Ver logs do MySQL
sudo tail -f /var/log/mysql/error.log
```

### Métricas do Sistema
```bash
# Uso de CPU e memória
htop

# Espaço em disco
df -h

# Conexões MySQL
mysql -u rmb_user -p -e "SHOW PROCESSLIST;"
```

## 🔄 Backup e Restauração

### Backup do Banco
```bash
# Criar backup
mysqldump -u rmb_user -p rmb_transportes > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup automático (crontab)
crontab -e
# Adicionar linha:
# 0 2 * * * mysqldump -u rmb_user -prmb_password_123! rmb_transportes > /backups/rmb_$(date +\%Y\%m\%d).sql
```

### Restauração
```bash
# Restaurar backup
mysql -u rmb_user -p rmb_transportes < backup_20241229_020000.sql
```

## 📞 Suporte

Em caso de problemas:

1. Verifique os logs do sistema
2. Consulte a documentação no README.md
3. Verifique se todos os serviços estão rodando
4. Teste as conexões de rede

---

**Instalação concluída com sucesso!** 🎉

Acesse http://localhost:5173 para usar o sistema RMB Transportes.

