#!/bin/bash

# Script de Deploy Automático - RMB Transportes
# Execute na VPS: bash deploy.sh

echo "🚀 Iniciando deploy do RMB Transportes..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório do projeto (ajuste conforme necessário)
PROJECT_DIR="/home/$USER/RMB_TRANSPORTES"

# Função para verificar erros
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro: $1${NC}"
        exit 1
    fi
}

# 1. Ir para diretório do projeto
echo -e "${YELLOW}📂 Navegando para $PROJECT_DIR${NC}"
cd $PROJECT_DIR || check_error "Diretório não encontrado"

# 2. Fazer backup do banco de dados
echo -e "${YELLOW}💾 Criando backup do banco de dados...${NC}"
read -p "Nome do banco de dados: " DB_NAME
read -sp "Senha do MySQL: " DB_PASS
echo
mysqldump -u root -p$DB_PASS $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql
check_error "Falha ao criar backup"
echo -e "${GREEN}✅ Backup criado${NC}"

# 3. Puxar últimas alterações
echo -e "${YELLOW}📥 Baixando últimas alterações do GitHub...${NC}"
git pull origin main
check_error "Falha ao fazer git pull"
echo -e "${GREEN}✅ Código atualizado${NC}"

# 4. Atualizar backend
echo -e "${YELLOW}⚙️  Atualizando backend...${NC}"
cd backend
npm install --production
check_error "Falha ao instalar dependências do backend"
echo -e "${GREEN}✅ Backend atualizado${NC}"

# 5. Executar migrações (se houver)
echo -e "${YELLOW}🗄️  Executando migrações do banco...${NC}"
if [ -f "../migration.sql" ]; then
    mysql -u root -p$DB_PASS $DB_NAME < ../migration.sql
    check_error "Falha ao executar migrações"
    echo -e "${GREEN}✅ Migrações executadas${NC}"
else
    echo -e "${YELLOW}⚠️  Nenhum arquivo de migração encontrado${NC}"
fi

# 6. Reiniciar backend com PM2
echo -e "${YELLOW}🔄 Reiniciando backend...${NC}"
pm2 restart rmb-backend || pm2 start server.js --name rmb-backend
check_error "Falha ao reiniciar backend"
pm2 save
echo -e "${GREEN}✅ Backend reiniciado${NC}"

# 7. Atualizar frontend
echo -e "${YELLOW}🎨 Atualizando frontend...${NC}"
cd ../frontend
npm install
check_error "Falha ao instalar dependências do frontend"

echo -e "${YELLOW}🏗️  Buildando frontend...${NC}"
npm run build
check_error "Falha ao buildar frontend"
echo -e "${GREEN}✅ Frontend buildado${NC}"

# 8. Recarregar Nginx
echo -e "${YELLOW}🌐 Recarregando Nginx...${NC}"
sudo systemctl reload nginx
check_error "Falha ao recarregar Nginx"
echo -e "${GREEN}✅ Nginx recarregado${NC}"

# 9. Verificar status
echo -e "\n${GREEN}✨ Deploy concluído com sucesso!${NC}\n"
echo -e "${YELLOW}📊 Status dos serviços:${NC}"
pm2 status
echo ""
sudo systemctl status nginx --no-pager | head -n 5

echo -e "\n${GREEN}🎉 Sistema atualizado e rodando!${NC}"
echo -e "${YELLOW}📝 Para ver logs do backend: pm2 logs rmb-backend${NC}"
echo -e "${YELLOW}📝 Para ver logs do nginx: sudo tail -f /var/log/nginx/rmb-error.log${NC}"
