const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar model User para inicialização
const User = require('./models/User');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const truckRoutes = require('./routes/truckRoutes');
const revenueRoutes = require('./routes/revenueRoutes');
const fuelExpenseRoutes = require('./routes/fuelExpenseRoutes');
const driverExpenseRoutes = require('./routes/driverExpenseRoutes');
const maintenanceExpenseRoutes = require('./routes/maintenanceExpenseRoutes');
const reportRoutes = require('./routes/reportRoutes');
const otherExpensesRoutes = require('./routes/otherExpenses');


const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors()); // Permitir requisições de qualquer origem
app.use(express.json()); // Para parsing de JSON

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/revenues', revenueRoutes);
app.use('/api/fuel_expenses', fuelExpenseRoutes);
app.use('/api/driver_expenses', driverExpenseRoutes);
app.use('/api/maintenance_expenses', maintenanceExpenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/other_expenses', otherExpensesRoutes);


// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API RMB Transportes funcionando!' });
});

// Inicializar banco de dados e criar usuário padrão
const initializeDatabase = async () => {
  try {
    await User.createTable();
    await User.createDefaultAdmin();
  } catch (error) {
    console.error('Erro ao initializar banco de dados:', error);
  }
};

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  await initializeDatabase();
});

