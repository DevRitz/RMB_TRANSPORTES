const Revenue = require('../models/Revenue');

// normaliza "1.234,56" -> 1234.56
const toNumber = (value) => {
  if (value == null || value === '') return 0;
  const s = String(value).trim();
  const normalized = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
};

// Criar
exports.createRevenue = async (req, res) => {
  const { truck_id, amount, description, revenue_date } = req.body;

  if (!truck_id || amount == null || !revenue_date) {
    return res.status(400).json({ error: 'Caminhão, valor e data são obrigatórios' });
  }

  const amountNum = typeof amount === 'number' ? amount : toNumber(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: 'Valor inválido' });
  }

  try {
    const result = await Revenue.create(truck_id, amountNum, description ?? null, revenue_date);
    res.status(201).json({ message: 'Receita criada com sucesso', id: result.insertId });
  } catch (err) {
    console.error('Erro ao criar receita:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Listar por caminhão
exports.getRevenuesByTruck = async (req, res) => {
  const { truck_id } = req.params;
  
  try {
    const results = await Revenue.findByTruckId(truck_id);
    res.json(results);
  } catch (err) {
    console.error('Erro ao buscar receitas:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Listar todas
exports.getAllRevenues = async (req, res) => {
  try {
    const results = await Revenue.findAll() || [];
    res.json(results);
  } catch (err) {
    console.error('Erro ao buscar receitas:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar por ID
exports.getRevenueById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

  try {
    const rows = await Revenue.findById(id);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar receita:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar
exports.updateRevenue = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { truck_id, amount, description, revenue_date } = req.body;

  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });
  if (!truck_id || amount == null || !revenue_date) {
    return res.status(400).json({ error: 'truck_id, amount e revenue_date são obrigatórios' });
  }

  const amountNum = typeof amount === 'number' ? amount : toNumber(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: 'Valor inválido' });
  }

  try {
    await Revenue.updateById(id, { truck_id, amount: amountNum, description, revenue_date });
    res.json({ message: 'Receita atualizada com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar receita:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Excluir
exports.deleteRevenue = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

  try {
    const result = await Revenue.deleteById(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    res.json({ message: 'Receita excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir receita:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
