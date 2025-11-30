const MaintenanceExpense = require('../models/MaintenanceExpense');

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
exports.createMaintenanceExpense = async (req, res) => {
  const { truck_id, amount, mileage, description, expense_date } = req.body;

  if (!truck_id || amount == null || !expense_date) {
    return res.status(400).json({ error: 'Caminhão, valor e data são obrigatórios' });
  }

  const truckIdNum = toInt(truck_id);
  const amountNum = typeof amount === 'number' ? amount : toNumber(amount);
  const mileageInt = mileage != null ? toInt(mileage) : null;

  if (!Number.isInteger(truckIdNum)) return res.status(400).json({ error: 'truck_id inválido' });
  if (!Number.isFinite(amountNum) || amountNum < 0) return res.status(400).json({ error: 'amount inválido' });
  if (mileageInt != null && (!Number.isInteger(mileageInt) || mileageInt < 0))
    return res.status(400).json({ error: 'mileage inválido' });

  try {
    const result = await MaintenanceExpense.create(truckIdNum, amountNum, mileageInt, description ?? null, expense_date);
    return res.status(201).json({ message: 'Despesa de manutenção criada com sucesso', id: result?.insertId });
  } catch (err) {
    console.error('Erro ao criar despesa de manutenção:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// LISTS
exports.getMaintenanceExpensesByTruck = async (req, res) => {
  const truckIdNum = toInt(req.params.truck_id);
  if (!Number.isInteger(truckIdNum)) return res.status(400).json({ error: 'truck_id inválido' });

  try {
    const results = await MaintenanceExpense.findByTruckId(truckIdNum);
    return res.json(results);
  } catch (err) {
    console.error('Erro ao buscar despesas de manutenção:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.getAllMaintenanceExpenses = async (req, res) => {
  try {
    const results = await MaintenanceExpense.findAll();
    return res.json(results);
  } catch (err) {
    console.error('Erro ao buscar despesas de manutenção:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// (opcional) período
exports.getMaintenanceExpensesByPeriod = async (req, res) => {
  const year = toInt(req.query.year);
  const month = toInt(req.query.month);
  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return res.status(400).json({ error: 'Parâmetros year e month são obrigatórios' });
  }

  try {
    const results = await MaintenanceExpense.findByPeriod(year, month);
    return res.json(results);
  } catch (err) {
    console.error('Erro ao buscar despesas de manutenção por período:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// READ by ID
exports.getMaintenanceExpenseById = async (req, res) => {
  const id = toInt(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

  try {
    const rows = await MaintenanceExpense.findById(id);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Registro não encontrado' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar despesa de manutenção por id:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// UPDATE by ID
exports.updateMaintenanceExpense = async (req, res) => {
  const id = toInt(req.params.id);
  const { truck_id, amount, mileage, description, expense_date } = req.body;

  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });
  if (!truck_id || amount == null || !expense_date)
    return res.status(400).json({ error: 'Caminhão, valor e data são obrigatórios' });

  const truckIdNum = toInt(truck_id);
  const amountNum = typeof amount === 'number' ? amount : toNumber(amount);
  const mileageInt = mileage != null ? toInt(mileage) : null;

  if (!Number.isInteger(truckIdNum)) return res.status(400).json({ error: 'truck_id inválido' });
  if (!Number.isFinite(amountNum) || amountNum < 0) return res.status(400).json({ error: 'amount inválido' });
  if (mileageInt != null && (!Number.isInteger(mileageInt) || mileageInt < 0))
    return res.status(400).json({ error: 'mileage inválido' });

  try {
    const result = await MaintenanceExpense.updateById(
      id,
      truckIdNum,
      amountNum,
      mileageInt,
      description ?? null,
      expense_date
    );
    if (result?.affectedRows === 0) return res.status(404).json({ error: 'Registro não encontrado' });
    return res.json({ message: 'Despesa de manutenção atualizada com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar despesa de manutenção:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// DELETE by ID
exports.deleteMaintenanceExpense = async (req, res) => {
  const id = toInt(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

  try {
    const result = await MaintenanceExpense.deleteById(id);
    if (result?.affectedRows === 0) return res.status(404).json({ error: 'Registro não encontrado' });
    return res.json({ message: 'Despesa de manutenção excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir despesa de manutenção:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
