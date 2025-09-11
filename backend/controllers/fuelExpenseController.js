const FuelExpense = require('../models/FuelExpense');

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
exports.createFuelExpense = (req, res) => {
  const { truck_id, liters, price_per_liter, mileage, expense_date } = req.body;

  if (!truck_id || liters == null || price_per_liter == null || mileage == null || !expense_date) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  const truckIdNum = toInt(truck_id);
  const litersNum = typeof liters === 'number' ? liters : toNumber(liters);
  const priceNum = typeof price_per_liter === 'number' ? price_per_liter : toNumber(price_per_liter);
  const mileageInt = toInt(mileage);

  if (!Number.isInteger(truckIdNum)) return res.status(400).json({ error: 'truck_id inválido' });
  if (!Number.isFinite(litersNum) || litersNum <= 0) return res.status(400).json({ error: 'liters inválido' });
  if (!Number.isFinite(priceNum) || priceNum < 0) return res.status(400).json({ error: 'price_per_liter inválido' });
  if (!Number.isInteger(mileageInt) || mileageInt < 0) return res.status(400).json({ error: 'mileage inválido' });

  FuelExpense.create(truckIdNum, litersNum, priceNum, mileageInt, expense_date, (err, result) => {
    if (err) {
      console.error('Erro ao criar despesa de combustível:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    return res.status(201).json({ message: 'Despesa de combustível criada com sucesso', id: result.insertId });
  });
};

// LISTS
exports.getAllFuelExpenses = (req, res) => {
  FuelExpense.findAll((err, results) => {
    if (err) {
      console.error('Erro ao buscar despesas de combustível:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    return res.json(results);
  });
};

exports.getFuelExpensesByTruck = (req, res) => {
  const truckIdNum = toInt(req.params.truck_id);
  if (!Number.isInteger(truckIdNum)) return res.status(400).json({ error: 'truck_id inválido' });

  FuelExpense.findByTruckId(truckIdNum, (err, results) => {
    if (err) {
      console.error('Erro ao buscar despesas de combustível:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    return res.json(results);
  });
};

// READ by ID
exports.getFuelExpenseById = (req, res) => {
  const id = toInt(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

  FuelExpense.findById(id, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar despesa de combustível por id:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Registro não encontrado' });
    return res.json(rows[0]);
  });
};

// UPDATE by ID
exports.updateFuelExpense = (req, res) => {
  const id = toInt(req.params.id);
  const { truck_id, liters, price_per_liter, mileage, expense_date } = req.body;

  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });
  if (!truck_id || liters == null || price_per_liter == null || mileage == null || !expense_date) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  const truckIdNum = toInt(truck_id);
  const litersNum = typeof liters === 'number' ? liters : toNumber(liters);
  const priceNum = typeof price_per_liter === 'number' ? price_per_liter : toNumber(price_per_liter);
  const mileageInt = toInt(mileage);

  if (!Number.isInteger(truckIdNum)) return res.status(400).json({ error: 'truck_id inválido' });
  if (!Number.isFinite(litersNum) || litersNum <= 0) return res.status(400).json({ error: 'liters inválido' });
  if (!Number.isFinite(priceNum) || priceNum < 0) return res.status(400).json({ error: 'price_per_liter inválido' });
  if (!Number.isInteger(mileageInt) || mileageInt < 0) return res.status(400).json({ error: 'mileage inválido' });

  FuelExpense.updateById(id, truckIdNum, litersNum, priceNum, mileageInt, expense_date, (err, result) => {
    if (err) {
      console.error('Erro ao atualizar despesa de combustível:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (result?.affectedRows === 0) return res.status(404).json({ error: 'Registro não encontrado' });
    return res.json({ message: 'Despesa de combustível atualizada com sucesso' });
  });
};

// DELETE by ID
exports.deleteFuelExpense = (req, res) => {
  const id = toInt(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

  FuelExpense.deleteById(id, (err, result) => {
    if (err) {
      console.error('Erro ao excluir despesa de combustível:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (result?.affectedRows === 0) return res.status(404).json({ error: 'Registro não encontrado' });
    return res.json({ message: 'Despesa de combustível excluída com sucesso' });
  });
};

exports.getFuelExpensesByPeriod = (req, res) => {
  const year = parseInt(req.query.year, 10);
  const month = parseInt(req.query.month, 10);
  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return res.status(400).json({ error: 'Parâmetros year e month são obrigatórios' });
  }
  FuelExpense.findByPeriod(year, month, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar despesas de combustível por período:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    return res.json(rows);
  });
};