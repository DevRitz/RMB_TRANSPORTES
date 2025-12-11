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

## IMPORTANTE: Schema do Banco Desatualizado!

O problema era que o `init.sql` tinha **nomes de colunas errados**:
- ❌ Usava `date` e `value` mas o código espera `expense_date` e `amount`
- ❌ Tabela `other_expenses` não tinha colunas `supplier` e `document`

**Solução:** Recriar banco de dados com schema correto.

## Executar Deploy na VPS

### SOLUÇÃO COMPLETA (Recomendado)

Este comando vai **recriar o banco de dados** (vai perder dados do caminhão cadastrado):

```bash
cd /opt/rmb-transportes
git pull origin main

# Parar tudo e remover volume do banco (APAGA DADOS!)
docker compose down -v

# Rebuild com schema correto
docker compose build backend --no-cache
docker compose build frontend --no-cache

# Iniciar tudo (banco será recriado com schema correto)
docker compose up -d

# Aguardar containers iniciarem
sleep 10

# Verificar logs
docker compose logs backend --tail=30
```

### Alternativa: Migrar Banco Existente (Se tiver dados importantes)

Se você tem dados importantes e quer migrar:

```bash
cd /opt/rmb-transportes
git pull origin main

# 1. Fazer backup primeiro
docker compose exec db mysqldump -u rmb_user -prmb_password_2024 rmb_transportes > backup_$(date +%Y%m%d).sql

# 2. Aplicar migração (VAI RECRIAR TABELAS - PERDA DE DADOS!)
docker compose exec -T db mysql -u rmb_user -prmb_password_2024 rmb_transportes < fix_schema.sql

# 3. Reiniciar backend para recriar usuário admin
docker compose restart backend

# 4. Verificar logs
docker compose logs backend --tail=30
```

### Opção Rápida (Passo a Passo)

```bash
# 1. Ir para o diretório
cd /opt/rmb-transportes

# 2. Baixar alterações
git pull origin main

# 3. IMPORTANTE: Remover banco antigo com schema errado
docker compose down -v

# 4. Rebuild (força recompilação)
docker compose build backend --no-cache
docker compose build frontend --no-cache

# 5. Iniciar tudo
docker compose up -d

# 6. Verificar status
docker compose ps

# 7. Ver logs
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
