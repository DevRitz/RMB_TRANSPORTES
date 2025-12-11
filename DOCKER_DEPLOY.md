# Deploy LIMPO com Docker na VPS Hostinger

## 📋 Pré-requisitos
- VPS com Linux (Ubuntu/Debian)
- Acesso root ou sudo
- Git instalado

## 🧹 PASSO 0: Limpar Sistema Antigo (IMPORTANTE)

```bash
# Parar e remover PM2
pm2 delete all
pm2 kill
sudo npm uninstall -g pm2

# Parar e desabilitar Nginx
sudo systemctl stop nginx
sudo systemctl disable nginx

# Parar MySQL (se existir)
sudo systemctl stop mysql
sudo systemctl disable mysql

# Remover projetos antigos
sudo rm -rf /var/www/RMB_TRANSPORTES
sudo rm -rf /root/rmb_app

# Limpar processos Node
pkill -f node

# Verificar portas liberadas
sudo lsof -i :80    # Deve estar vazio
sudo lsof -i :5000  # Deve estar vazio
sudo lsof -i :3306  # Deve estar vazio
```

## 🚀 Passo a Passo

### 1. Instalar Docker na VPS

```bash
# Atualizar sistema
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

# Adicionar repositório Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verificar instalação
sudo docker --version
sudo docker compose version

# Opcional: permitir rodar docker sem sudo
sudo usermod -aG docker $USER
# Faça logout e login novamente para aplicar
```

### 2. Clonar Projeto na VPS

```bash
# Criar diretório
sudo mkdir -p /opt/rmb-transportes
cd /opt/rmb-transportes

# Clonar repositório
sudo git clone https://github.com/DevRitz/RMB_TRANSPORTES.git .
```

### 3. Subir TODO o Sistema com Docker Compose (MySQL incluído)

```bash
# No diretório do projeto
cd /opt/rmb-transportes

# Subir TUDO: MySQL + Backend + Frontend
sudo docker compose up -d --build
```

**O que acontece:**
- Container MySQL é criado com banco `rmb_transportes`
- Backend espera MySQL ficar pronto (healthcheck)
- Backend cria tabela `users` e usuário `admin` automaticamente
- Frontend nginx serve a aplicação na porta 80

### 4. Verificar Status

```bash
# Ver containers rodando
sudo docker compose ps

# Deve mostrar 3 containers:
# - db (MySQL porta 3306)
# - backend (porta 5000)
# - frontend (porta 80)

# Ver logs do banco
sudo docker compose logs -f db

# Ver logs do backend
sudo docker compose logs -f backend

# Ver logs do frontend
sudo docker compose logs -f frontend

# Ver logs de tudo
sudo docker compose logs -f

# Para sair dos logs: Ctrl+C
```

### 5. Testar a Aplicação

1. Abra o navegador e acesse: `http://SEU_IP_VPS`
2. Faça login com:
   - **Usuário:** `admin`
   - **Senha:** `admin123`

### 6. Comandos Úteis

```bash
# Ver logs em tempo real
sudo docker compose logs -f

# Reiniciar todos os containers
sudo docker compose restart

# Parar todos os containers
sudo docker compose down

# Parar e remover volumes (⚠️ CUIDADO: apaga banco de dados!)
sudo docker compose down -v

# Rebuild completo após mudanças no código
cd /opt/rmb-transportes
git pull origin main
sudo docker compose up -d --build --force-recreate

# Ver uso de recursos
sudo docker stats

# Conectar no MySQL do container
sudo docker compose exec db mysql -u rmb_user -p
# Senha: rmb_password_2024
```

## 🔧 Troubleshooting

### Porta 80 ou 5000 já em uso

```bash
# Ver qual processo usa
sudo lsof -i :80
sudo lsof -i :5000

# Matar processo
sudo kill -9 PID_DO_PROCESSO

# Ou remover Nginx/PM2 antigo (ver PASSO 0)
```

### Containers não sobem

```bash
# Ver logs de erro
sudo docker compose logs

# Verificar se portas estão livres
sudo netstat -tlnp | grep -E ':(80|3306|5000)'

# Rebuild forçado
sudo docker compose down
sudo docker compose up -d --build --force-recreate
```

### Backend não conecta ao MySQL

```bash
# Aguardar MySQL inicializar (leva ~30s na primeira vez)
sudo docker compose logs -f db

# Quando ver "ready for connections", o MySQL está pronto
# Reiniciar backend
sudo docker compose restart backend
```

### Atualizar código após mudanças

```bash
cd /opt/rmb-transportes
sudo git pull origin main
sudo docker compose up -d --build
```

## 🔐 Segurança e Backup

### Configurar Firewall

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS (se configurar SSL depois)
sudo ufw enable
```

### Backup do Banco de Dados

```bash
# Criar backup do banco MySQL do container
sudo docker compose exec db mysqldump -u rmb_user -prmb_password_2024 rmb_transportes > backup_$(date +%Y%m%d).sql

# Restaurar backup
sudo docker compose exec -T db mysql -u rmb_user -prmb_password_2024 rmb_transportes < backup_20251210.sql
```

### Alterar Senhas (Produção)

Após deploy, altere:
1. **Senha do admin** no sistema (após primeiro login)
2. **Senhas do MySQL** no `docker-compose.yml`:
   - `MYSQL_ROOT_PASSWORD`
   - `MYSQL_PASSWORD`
   - Também em `backend` → `DB_PASSWORD`
3. **JWT_SECRET** no `docker-compose.yml` → `backend` → `JWT_SECRET`

Depois: `sudo docker compose up -d --build --force-recreate`

## ✅ Checklist Final

- [ ] Sistema antigo removido (PM2, Nginx, MySQL)
- [ ] Docker instalado
- [ ] Código clonado em `/opt/rmb-transportes`
- [ ] Executado `sudo docker compose up -d --build`
- [ ] 3 containers rodando: `sudo docker compose ps`
- [ ] Site acessível em `http://SEU_IP_VPS`
- [ ] Login funcionando com `admin/admin123`
- [ ] Firewall configurado
- [ ] Backup do banco criado

## 🎯 Resumo Completo (Copie e Cole)

```bash
# ==== LIMPAR SISTEMA ANTIGO ====
pm2 delete all; pm2 kill
sudo systemctl stop nginx mysql
sudo systemctl disable nginx mysql
sudo rm -rf /var/www/RMB_TRANSPORTES /root/rmb_app
pkill -f node

# ==== INSTALAR DOCKER ====
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# ==== CLONAR E SUBIR ====
sudo mkdir -p /opt/rmb-transportes
cd /opt/rmb-transportes
sudo git clone https://github.com/DevRitz/RMB_TRANSPORTES.git .
sudo docker compose up -d --build

# ==== VERIFICAR ====
sudo docker compose ps
sudo docker compose logs -f

# ==== FIREWALL ====
sudo ufw allow 22
sudo ufw allow 80
sudo ufw enable

# ==== ACESSAR ====
# http://SEU_IP_VPS
# Login: admin / admin123
```

## 📞 Problemas?

Se algo der errado:
```bash
# Ver logs detalhados
sudo docker compose logs

# Reiniciar tudo
sudo docker compose down
sudo docker compose up -d --build

# Remover tudo e começar do zero
sudo docker compose down -v
sudo docker compose up -d --build
```
