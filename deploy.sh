#!/bin/bash

# Script de Deploy Automático - RMB Transportes  
# Execute na VPS: bash deploy.sh

echo "🚀 Iniciando deploy do RMB Transportes..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_DIR="/opt/rmb-transportes"

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

# 2. Fazer backup do banco de dados (Docker)
echo -e "${YELLOW}💾 Criando backup do banco de dados...${NC}"
docker compose exec -T db mysqldump -u rmb_user -prmb_password_2024 rmb_transportes > backup_$(date +%Y%m%d_%H%M%S).sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup criado${NC}"
else
    echo -e "${YELLOW}⚠️  Aviso: Não foi possível criar backup (containers podem estar parados)${NC}"
fi

# 3. Puxar últimas alterações
echo -e "${YELLOW}📥 Baixando últimas alterações do GitHub...${NC}"
git pull origin main
check_error "Falha ao fazer git pull"
echo -e "${GREEN}✅ Código atualizado${NC}"

# 4. Parar containers
echo -e "${YELLOW}⏹️  Parando containers...${NC}"
docker compose down
echo -e "${GREEN}✅ Containers parados${NC}"

# 5. Rebuild do backend (rápido, só se mudou código)
echo -e "${YELLOW}⚙️  Reconstruindo backend...${NC}"
docker compose build backend
check_error "Falha ao buildar backend"
echo -e "${GREEN}✅ Backend reconstruído${NC}"

# 6. Rebuild do frontend (com cache limpo para garantir atualizações)
echo -e "${YELLOW}🎨 Reconstruindo frontend...${NC}"
docker compose build frontend --no-cache
check_error "Falha ao buildar frontend"
echo -e "${GREEN}✅ Frontend reconstruído${NC}"

# 7. Iniciar containers
echo -e "${YELLOW}🚀 Iniciando containers...${NC}"
docker compose up -d
check_error "Falha ao iniciar containers"
echo -e "${GREEN}✅ Containers iniciados${NC}"

# 8. Aguardar containers iniciarem
echo -e "${YELLOW}⏳ Aguardando containers iniciarem...${NC}"
sleep 10

# 9. Verificar status
echo -e "\n${GREEN}✨ Deploy concluído com sucesso!${NC}\n"
echo -e "${YELLOW}📊 Status dos containers:${NC}"
docker compose ps

echo -e "\n${YELLOW}📝 Últimas linhas do log do backend:${NC}"
docker compose logs backend --tail=20

echo -e "\n${GREEN}🎉 Sistema atualizado e rodando!${NC}"
echo -e "${YELLOW}Acesso: http://72.60.157.249${NC}"
echo -e "\n${YELLOW}Comandos úteis:${NC}"
echo -e "  Ver logs backend:   docker compose logs -f backend"
echo -e "  Ver logs frontend:  docker compose logs -f frontend"
echo -e "  Ver logs db:        docker compose logs -f db"
echo -e "  Status:             docker compose ps"
echo -e "  Parar tudo:         docker compose down"
