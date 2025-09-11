const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rotas
const truckRoutes = require('./routes/truckRoutes');
const revenueRoutes = require('./routes/revenueRoutes');
const fuelExpenseRoutes = require('./routes/fuelExpenseRoutes');
const driverExpenseRoutes = require('./routes/driverExpenseRoutes');
const maintenanceExpenseRoutes = require('./routes/maintenanceExpenseRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors()); // Permitir requisições de qualquer origem
app.use(express.json()); // Para parsing de JSON

// Rotas da API
app.use('/api/trucks', truckRoutes);
app.use('/api/revenues', revenueRoutes);
app.use('/api/fuel_expenses', fuelExpenseRoutes);
app.use('/api/driver_expenses', driverExpenseRoutes);
app.use('/api/maintenance_expenses', maintenanceExpenseRoutes);
app.use('/api/reports', reportRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API RMB Transportes funcionando!' });
});

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

