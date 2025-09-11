const Report = require('../models/Report');

// Balanço por caminhão
exports.getTruckBalance = (req, res) => {
  const { truck_id } = req.params;

  Report.getTruckBalance(truck_id, (err, results) => {
    if (err) {
      console.error('Erro ao buscar balanço do caminhão:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Caminhão não encontrado' });
    }
    res.json(results[0]);
  });
};

// Resumo mensal por caminhão
exports.getMonthlyTruckSummary = (req, res) => {
  const { truck_id } = req.params;
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ error: 'Ano e mês são obrigatórios' });
  }

  Report.getMonthlyTruckSummary(truck_id, year, month, (err, results) => {
    if (err) {
      console.error('Erro ao buscar resumo mensal do caminhão:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Caminhão não encontrado' });
    }
    res.json(results[0]);
  });
};

// Resumo mensal geral
exports.getGeneralMonthlySummary = (req, res) => {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ error: 'Ano e mês são obrigatórios' });
  }

  Report.getGeneralMonthlySummary(year, month, (err, results) => {
    if (err) {
      console.error('Erro ao buscar resumo mensal geral:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(results);
  });
};

// Total gasto com motoristas
exports.getDriverExpensesTotal = (req, res) => {
  const { year, month } = req.query;

  Report.getDriverExpensesTotal(year, month, (err, results) => {
    if (err) {
      console.error('Erro ao buscar total de despesas com motoristas:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(results[0]);
  });
};

