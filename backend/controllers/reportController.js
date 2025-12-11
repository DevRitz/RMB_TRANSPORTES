const Report = require('../models/Report');

// Balanço por caminhão
exports.getTruckBalance = async (req, res) => {
  const { truck_id } = req.params;

  try {
    const results = await Report.getTruckBalance(truck_id);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Caminhão não encontrado' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Erro ao buscar balanço do caminhão:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Resumo mensal por caminhão
exports.getMonthlyTruckSummary = async (req, res) => {
  const { truck_id } = req.params;
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ error: 'Ano e mês são obrigatórios' });
  }

  try {
    const results = await Report.getMonthlyTruckSummary(truck_id, year, month);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Caminhão não encontrado' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Erro ao buscar resumo mensal do caminhão:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Resumo mensal geral
exports.getGeneralMonthlySummary = async (req, res) => {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ error: 'Ano e mês são obrigatórios' });
  }

  try {
    const results = await Report.getGeneralMonthlySummary(year, month);
    // Retorna array vazio se não houver resultados
    res.json(results || []);
  } catch (err) {
    console.error('Erro ao buscar resumo mensal geral:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Total gasto com motoristas
exports.getDriverExpensesTotal = async (req, res) => {
  const { year, month } = req.query;

  try {
    const results = await Report.getDriverExpensesTotal(year, month);
    // Retorna objeto com total 0 se não houver resultados
    res.json(results[0] || { total: 0 });
  } catch (err) {
    console.error('Erro ao buscar total de despesas com motoristas:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

