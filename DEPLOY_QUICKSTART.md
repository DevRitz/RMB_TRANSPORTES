# Guia Rápido de Deploy

## Correções Implementadas

Corrigi o problema dos erros 500. Os controllers estavam tentando retornar `null` ou `undefined` quando não havia dados, causando erro. Agora todos retornam arrays vazios `[]` ou objetos com valores zerados quando não houver dados.

### Arquivos Corrigidos:
- ✅ `backend/controllers/reportController.js` - Retorna arrays vazios e objetos com total: 0
- ✅ `backend/controllers/revenueController.js` - Retorna array vazio quando não houver receitas  
- ✅ `backend/controllers/fuelExpenseController.js` - Retorna array vazio quando não houver despesas de combustível
- ✅ `backend/controllers/driverExpenseController.js` - Retorna array vazio quando não houver despesas de motorista
- ✅ `backend/controllers/maintenanceExpenseController.js` - Retorna array vazio quando não houver despesas de manutenção
- ✅ `backend/controllers/otherExpenseController.js` - Retorna array vazio quando não houver outras despesas

## Executar Deploy na VPS

### Opção 1: Script Automatizado (Recomendado)

```bash
# Na VPS, no diretório do projeto
cd /opt/rmb-transportes

# Executar o script de deploy
bash deploy.sh
```

O script vai:
1. ✅ Criar backup do banco de dados
2. ✅ Baixar últimas alterações do GitHub
3. ✅ Parar os containers
4. ✅ Reconstruir backend
5. ✅ Reconstruir frontend (sem cache)
6. ✅ Iniciar todos os containers
7. ✅ Mostrar status e logs

### Opção 2: Manual (Passo a Passo)

```bash
# 1. Ir para o diretório do projeto
cd /opt/rmb-transportes

# 2. Baixar alterações
git pull origin main

# 3. Parar containers
docker compose down

# 4. Rebuild do backend
docker compose build backend

# 5. Rebuild do frontend (sem cache para forçar atualização)
docker compose build frontend --no-cache

# 6. Iniciar tudo
docker compose up -d

# 7. Verificar status
docker compose ps

# 8. Ver logs do backend para confirmar
docker compose logs backend --tail=30
```

## Verificar se Funcionou

1. Acesse o dashboard: http://72.60.157.249
2. Faça login com `admin` / `admin123`
3. Navegue pelas páginas - **não deve mais aparecer erro 500**
4. As páginas vazias vão mostrar tabelas vazias (sem dados) mas sem erros
5. Depois de cadastrar receitas/despesas, os dados vão aparecer normalmente

## O que Mudou?

**ANTES:**
```javascript
// Quando não havia dados, retornava null/undefined
const results = await Revenue.findAll();
res.json(results); // Se results fosse null, causava erro
```

**DEPOIS:**
```javascript
// Sempre retorna array vazio se não houver dados
const results = await Revenue.findAll() || [];
res.json(results); // Sempre retorna array válido
```

## Comandos Úteis

```bash
# Ver logs em tempo real
docker compose logs -f backend
docker compose logs -f frontend

# Verificar status
docker compose ps

# Reiniciar apenas backend
docker compose restart backend

# Reiniciar tudo
docker compose restart

# Parar tudo
docker compose down

# Criar backup do banco
docker compose exec db mysqldump -u rmb_user -prmb_password_2024 rmb_transportes > backup_$(date +%Y%m%d).sql
```

## Próximos Passos

Agora você pode usar o sistema normalmente:

1. ✅ Cadastrar receitas
2. ✅ Cadastrar despesas (combustível, motorista, manutenção, outras)
3. ✅ Ver relatórios
4. ✅ Dashboard vai mostrar estatísticas conforme você adiciona dados

**Nenhum erro 500 deve mais aparecer!** 🎉
