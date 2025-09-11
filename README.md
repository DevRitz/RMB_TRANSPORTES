# RMB Transportes - Sistema de Controle de Frotas

Sistema completo para controle de frotas de caminhões desenvolvido com React, Node.js, Express e MySQL.

## 📋 Funcionalidades

### Gestão de Caminhões
- ✅ Cadastro de caminhões por placa
- ✅ Listagem de todos os caminhões
- ✅ Edição e exclusão de caminhões
- ✅ Visualização detalhada por caminhão

### Controle Financeiro
- ✅ Registro de receitas por caminhão e data
- ✅ Registro de despesas de combustível (litros, preço, quilometragem)
- ✅ Registro de despesas com motoristas (diárias, ajudas de custo)
- ✅ Registro de despesas de manutenção (mecânica, revisões, reparos)

### Relatórios e Análises
- ✅ Balanço individual por caminhão (receitas vs despesas)
- ✅ Relatórios mensais por caminhão e geral
- ✅ Análise de gastos com motoristas
- ✅ Gráficos interativos com Recharts
- ✅ Filtros por data (ano/mês)

### Interface
- ✅ Design responsivo (desktop e mobile)
- ✅ Tema azul e branco da RMB Transportes
- ✅ Navegação intuitiva com sidebar
- ✅ Componentes reutilizáveis com shadcn/ui
- ✅ Notificações toast para feedback

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MySQL** - Banco de dados relacional
- **mysql2** - Driver MySQL para Node.js
- **cors** - Middleware para CORS
- **dotenv** - Gerenciamento de variáveis de ambiente

### Frontend
- **React** - Biblioteca para interfaces
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Componentes UI
- **Lucide React** - Ícones
- **Recharts** - Gráficos e visualizações

## 📁 Estrutura do Projeto

```
rmb-transportes-app/
├── backend/                 # API Node.js + Express
│   ├── config/             # Configurações (banco de dados)
│   ├── controllers/        # Controladores da API
│   ├── models/            # Modelos de dados
│   ├── routes/            # Rotas da API
│   ├── .env               # Variáveis de ambiente
│   ├── server.js          # Servidor principal
│   └── package.json       # Dependências do backend
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── services/      # Serviços de API
│   │   ├── hooks/         # Hooks customizados
│   │   └── App.jsx        # Componente principal
│   ├── public/            # Arquivos estáticos
│   └── package.json       # Dependências do frontend
└── database_schema.sql     # Schema do banco de dados
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 18 ou superior)
- MySQL (versão 8.0 ou superior)
- pnpm (ou npm/yarn)

### 1. Configuração do Banco de Dados

```bash
# Instalar e iniciar MySQL
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql

# Criar banco e usuário
sudo mysql -e "
CREATE DATABASE rmb_transportes;
CREATE USER 'rmb_user'@'localhost' IDENTIFIED BY 'rmb_password';
GRANT ALL PRIVILEGES ON rmb_transportes.* TO 'rmb_user'@'localhost';
FLUSH PRIVILEGES;
"

# Importar schema
mysql -u rmb_user -prmb_password rmb_transportes < database_schema.sql
```

### 2. Configuração do Backend

```bash
# Navegar para o diretório do backend
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Edite o arquivo .env com suas configurações:
# DB_HOST=localhost
# DB_USER=rmb_user
# DB_PASSWORD=rmb_password
# DB_NAME=rmb_transportes
# PORT=5000

# Iniciar servidor
npm start
# ou para desenvolvimento:
npm run dev
```

### 3. Configuração do Frontend

```bash
# Navegar para o diretório do frontend
cd frontend

# Instalar dependências
pnpm install

# Iniciar aplicação
pnpm run dev
```

### 4. Acessar a Aplicação

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📊 Endpoints da API

### Caminhões
- `GET /api/trucks` - Listar todos os caminhões
- `POST /api/trucks` - Criar novo caminhão
- `GET /api/trucks/:id` - Obter caminhão por ID
- `PUT /api/trucks/:id` - Atualizar caminhão
- `DELETE /api/trucks/:id` - Excluir caminhão

### Receitas
- `POST /api/revenues` - Registrar receita
- `GET /api/revenues/truck/:truck_id` - Receitas por caminhão

### Despesas de Combustível
- `POST /api/fuel_expenses` - Registrar despesa de combustível
- `GET /api/fuel_expenses/truck/:truck_id` - Despesas por caminhão

### Despesas de Motorista
- `POST /api/driver_expenses` - Registrar despesa de motorista
- `GET /api/driver_expenses/truck/:truck_id` - Despesas por caminhão

### Despesas de Manutenção
- `POST /api/maintenance_expenses` - Registrar despesa de manutenção
- `GET /api/maintenance_expenses/truck/:truck_id` - Despesas por caminhão

### Relatórios
- `GET /api/reports/balance/:truck_id` - Balanço por caminhão
- `GET /api/reports/monthly/:truck_id?year=2024&month=12` - Resumo mensal por caminhão
- `GET /api/reports/monthly?year=2024&month=12` - Resumo mensal geral
- `GET /api/reports/driver_expenses?year=2024&month=12` - Total de despesas com motoristas

## 🎨 Design e UX

### Paleta de Cores
- **Primário**: Azul (#007bff, #17a2b8)
- **Secundário**: Branco (#ffffff)
- **Sucesso**: Verde (#22c55e)
- **Erro**: Vermelho (#ef4444)
- **Aviso**: Laranja (#f97316)

### Componentes Principais
- **Layout**: Sidebar responsiva com navegação
- **Dashboard**: Cards de estatísticas e ações rápidas
- **Formulários**: Validação e feedback visual
- **Tabelas**: Listagem com ações (visualizar, editar, excluir)
- **Gráficos**: Barras, pizza e linha para análises
- **Modais**: Confirmações e formulários pop-up

## 🔧 Desenvolvimento

### Scripts Disponíveis

**Backend:**
```bash
npm start          # Produção
npm run dev        # Desenvolvimento com nodemon
```

**Frontend:**
```bash
pnpm run dev       # Servidor de desenvolvimento
pnpm run build     # Build para produção
pnpm run preview   # Preview do build
```

### Estrutura de Dados

**Tabelas do Banco:**
- `trucks` - Caminhões cadastrados
- `revenues` - Receitas por caminhão
- `fuel_expenses` - Despesas de combustível
- `driver_expenses` - Despesas com motoristas
- `maintenance_expenses` - Despesas de manutenção

## 📝 Funcionalidades Futuras

- [ ] Autenticação e autorização de usuários
- [ ] Backup automático do banco de dados
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Notificações por email
- [ ] Dashboard com métricas em tempo real
- [ ] Integração com APIs de combustível
- [ ] Aplicativo mobile
- [ ] Controle de motoristas individuais

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Equipe

Desenvolvido para **RMB Transportes** - Sistema de controle de frotas de caminhões.

---

**RMB Transportes** - Controle eficiente da sua frota! 🚛

"# RMB_TRANSPORTES" 
