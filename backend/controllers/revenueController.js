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
exports.createRevenue = (req, res) => {
  const { truck_id, amount, description, revenue_date } = req.body;

  if (!truck_id || amount == null || !revenue_date) {
    return res.status(400).json({ error: 'Caminhão, valor e data são obrigatórios' });
  }

  const amountNum = typeof amount === 'number' ? amount : toNumber(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: 'Valor inválido' });
  }

  Revenue.create(truck_id, amountNum, description ?? null, revenue_date, (err, result) => {
    if (err) {
      console.error('Erro ao criar receita:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.status(201).json({ message: 'Receita criada com sucesso', id: result.insertId });
  });
};

// Listar por caminhão
exports.getRevenuesByTruck = (req, res) => {
  const { truck_id } = req.params;
  Revenue.findByTruckId(truck_id, (err, results) => {
    if (err) {
      console.error('Erro ao buscar receitas:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(results);
  });
};

// Listar todas
exports.getAllRevenues = (req, res) => {
  Revenue.findAll((err, results) => {
    if (err) {
      console.error('Erro ao buscar receitas:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(results);
  });
};

// Buscar por ID
exports.getRevenueById = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

  Revenue.findById(id, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar receita:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Não encontrada' });
    res.json(rows[0]);
  });
};

// Atualizar
exports.updateRevenue = (req, res) => {
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

  Revenue.updateById(id, { truck_id, amount: amountNum, description, revenue_date }, (err) => {
    if (err) {
      console.error('Erro ao atualizar receita:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json({ message: 'Receita atualizada com sucesso' });
  });
};

// Excluir
exports.deleteRevenue = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

  Revenue.deleteById(id, (err, result) => {
    if (err) {
      console.error('Erro ao excluir receita:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    res.json({ message: 'Receita excluída com sucesso' });
  });
};
