const DriverExpense = require('../models/DriverExpense');

// helpers
const toNumber = (v) => {
  if (v == null || v === '') return 0;
  const s = String(v).trim();
  const n = parseFloat(s.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};
const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isInteger(n) ? n : null;
};

// CREATE
exports.createDriverExpense = (req, res) => {
  const { truck_id, amount, description, expense_date } = req.body;

  if (!truck_id || amount == null || !expense_date) {
    return res.status(400).json({ error: 'Caminhão, valor e data são obrigatórios' });
  }

  const truckIdNum = toInt(truck_id);
  const amountNum = typeof amount === 'number' ? amount : toNumber(amount);

  if (!Number.isInteger(truckIdNum)) return res.status(400).json({ error: 'truck_id inválido' });
  if (!Number.isFinite(amountNum) || amountNum < 0) return res.status(400).json({ error: 'amount inválido' });

  DriverExpense.create(truckIdNum, amountNum, description ?? null, expense_date, (err, result) => {
    if (err) {
      console.error('Erro ao criar despesa de motorista:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    return res.status(201).json({ message: 'Despesa de motorista criada com sucesso', id: result?.insertId });
  });
};

// READ by ID
exports.getDriverExpenseById = (req, res) => {
  const id = toInt(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

  DriverExpense.findById(id, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar despesa de motorista por id:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Despesa não encontrada' });
    return res.json(rows[0]);
  });
};

// UPDATE by ID
exports.updateDriverExpense = (req, res) => {
  const id = toInt(req.params.id);
  const { truck_id, amount, description, expense_date } = req.body;

  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });
  if (!truck_id || amount == null || !expense_date) {
    return res.status(400).json({ error: 'Caminhão, valor e data são obrigatórios' });
  }

  const truckIdNum = toInt(truck_id);
  const amountNum = typeof amount === 'number' ? amount : toNumber(amount);

  if (!Number.isInteger(truckIdNum)) return res.status(400).json({ error: 'truck_id inválido' });
  if (!Number.isFinite(amountNum) || amountNum < 0) return res.status(400).json({ error: 'amount inválido' });

  DriverExpense.updateById(id, truckIdNum, amountNum, description ?? null, expense_date, (err, result) => {
    if (err) {
      console.error('Erro ao atualizar despesa de motorista:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (result?.affectedRows === 0) return res.status(404).json({ error: 'Despesa não encontrada' });
    return res.json({ message: 'Despesa de motorista atualizada com sucesso' });
  });
};

// DELETE by ID
exports.deleteDriverExpense = (req, res) => {
  const id = toInt(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

  DriverExpense.deleteById(id, (err, result) => {
    if (err) {
      console.error('Erro ao excluir despesa de motorista:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (result?.affectedRows === 0) return res.status(404).json({ error: 'Despesa não encontrada' });
    return res.json({ message: 'Despesa de motorista excluída com sucesso' });
  });
};

// LISTS
exports.getDriverExpensesByTruck = (req, res) => {
  const truckIdNum = toInt(req.params.truck_id);
  if (!Number.isInteger(truckIdNum)) return res.status(400).json({ error: 'truck_id inválido' });

  DriverExpense.findByTruckId(truckIdNum, (err, results) => {
    if (err) {
      console.error('Erro ao buscar despesas de motorista:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    return res.json(results);
  });
};

exports.getAllDriverExpenses = (req, res) => {
  DriverExpense.findAll((err, results) => {
    if (err) {
      console.error('Erro ao buscar despesas de motorista:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    return res.json(results);
  });
};


exports.getDriverExpensesByPeriod = (req, res) => {
  const year = parseInt(req.query.year, 10);
  const month = parseInt(req.query.month, 10);
  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return res.status(400).json({ error: 'Parâmetros year e month são obrigatórios' });
  }
  DriverExpense.findByPeriod(year, month, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar despesas de motorista por período:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    return res.json(rows);
  });
};
