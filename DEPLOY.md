# Deploy RMB Transportes - Guia Completo

## 📦 Pré-requisitos na VPS

- Node.js 18+ instalado
- MySQL rodando
- PM2 instalado globalmente: `npm install -g pm2`
- Git instalado

## 🚀 Passo a Passo do Deploy

### 1. Fazer Push para o GitHub

```bash
# No seu computador local (Windows)
cd d:\RMB_PROJETO\rmb-transportes-app

# Inicializar git (se ainda não estiver)
git init
git add .
git commit -m "Deploy: Sistema completo com autenticação JWT"

# Adicionar repositório remoto (substitua com seu repo)
git remote add origin https://github.com/DevRitz/RMB_TRANSPORTES.git
git branch -M main
git push -u origin main
```

### 2. Conectar na VPS via SSH

```bash
ssh seu_usuario@seu_ip_vps
# ou use o painel da Hostinger
```

### 3. Clonar/Atualizar o Projeto na VPS

```bash
# Se é primeira vez
cd /home/seu_usuario
git clone https://github.com/DevRitz/RMB_TRANSPORTES.git
cd RMB_TRANSPORTES

# Se já existe (atualizar)
cd /home/seu_usuario/RMB_TRANSPORTES
git pull origin main
```

### 4. Configurar o Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env (IMPORTANTE!)
nano .env
```

Cole no arquivo `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=seu_banco_de_dados
DB_PORT=3306
JWT_SECRET=sua_chave_secreta_super_segura_aqui_minimo_32_caracteres
```

Salve com `Ctrl+O`, Enter, `Ctrl+X`

### 5. Migrar o Banco de Dados

```bash
# Conectar no MySQL
mysql -u seu_usuario -p

# Executar os comandos do migration.sql
# Copie e cole o conteúdo ou:
source /home/seu_usuario/RMB_TRANSPORTES/migration.sql

# Verificar se a tabela users foi criada
USE seu_banco_de_dados;
SHOW TABLES;
DESCRIBE users;
exit;
```

### 6. Construir o Frontend

```bash
cd ../frontend

# Instalar dependências
npm install

# Criar arquivo .env
nano .env
```

Cole no arquivo `.env`:
```env
VITE_API_URL=http://seu_dominio_ou_ip:5000
```

```bash
# Build do frontend
npm run build

# Isso cria a pasta dist/ com os arquivos estáticos
```

### 7. Configurar PM2 para Backend

```bash
cd ../backend

# Iniciar backend com PM2
pm2 start server.js --name rmb-backend

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup

# Verificar status
pm2 status
pm2 logs rmb-backend
```

### 8. Configurar Nginx (Servidor Web)

```bash
sudo nano /etc/nginx/sites-available/rmb-transportes
```

Cole esta configuração:
```nginx
server {
    listen 80;
    server_name seu_dominio.com www.seu_dominio.com;

    # Frontend (arquivos estáticos)
    root /home/seu_usuario/RMB_TRANSPORTES/frontend/dist;
    index index.html;

    # SPA - todas as rotas retornam index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para API do backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Logs
    access_log /var/log/nginx/rmb-access.log;
    error_log /var/log/nginx/rmb-error.log;
}
```

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/rmb-transportes /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar nginx
sudo systemctl reload nginx
```

### 9. Configurar SSL (HTTPS) com Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu_dominio.com -d www.seu_dominio.com

# Renovação automática (já configurado)
sudo certbot renew --dry-run
```

### 10. Atualizar Frontend para usar HTTPS

```bash
cd /home/seu_usuario/RMB_TRANSPORTES/frontend

# Editar .env
nano .env
```

Altere para:
```env
VITE_API_URL=https://seu_dominio.com
```

```bash
# Rebuild
npm run build

# Recarregar nginx
sudo systemctl reload nginx
```

## 🔄 Atualizações Futuras

Quando fizer alterações no código:

```bash
# Na VPS
cd /home/seu_usuario/RMB_TRANSPORTES
git pull origin main

# Atualizar backend
cd backend
npm install
pm2 restart rmb-backend

# Atualizar frontend
cd ../frontend
npm install
npm run build
sudo systemctl reload nginx
```

## 🛠️ Comandos Úteis

```bash
# Ver logs do backend
pm2 logs rmb-backend

# Reiniciar backend
pm2 restart rmb-backend

# Parar backend
pm2 stop rmb-backend

# Ver logs do nginx
sudo tail -f /var/log/nginx/rmb-error.log

# Testar conexão com MySQL
mysql -u seu_usuario -p -e "SHOW DATABASES;"
```

## 🔐 Segurança

1. ✅ Altere a senha do usuário admin após primeiro login
2. ✅ Use senhas fortes no .env
3. ✅ Configure firewall:
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 📊 Backup do Banco de Dados

```bash
# Criar backup
mysqldump -u seu_usuario -p seu_banco_de_dados > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u seu_usuario -p seu_banco_de_dados < backup_20250101.sql
```

## 🎯 Checklist Final

- [ ] Código no GitHub
- [ ] VPS com Node.js e MySQL
- [ ] Backend rodando com PM2
- [ ] Frontend buildado
- [ ] Nginx configurado
- [ ] SSL instalado (HTTPS)
- [ ] Tabela users criada
- [ ] Usuário admin funcionando
- [ ] Dados antigos preservados
- [ ] Backup do banco criado

## 🆘 Troubleshooting

### Backend não inicia
```bash
pm2 logs rmb-backend
# Verificar .env
# Verificar conexão MySQL
```

### Frontend mostra página em branco
```bash
# Verificar se API_URL está correto no .env
# Verificar logs do nginx
sudo tail -f /var/log/nginx/rmb-error.log
```

### Erro 502 Bad Gateway
```bash
# Backend não está rodando
pm2 status
pm2 restart rmb-backend
```

### Não consegue fazer login
```bash
# Verificar se tabela users existe
mysql -u seu_usuario -p
USE seu_banco_de_dados;
SELECT * FROM users;

# Recriar admin
node
> const User = require('./models/User');
> User.createDefaultAdmin();
```
