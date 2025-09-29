// backend/controllers/otherExpenseController.js
const OtherExpense = require('../models/OtherExpense');

const toNumber = (v) => OtherExpense._toNumber(v);
const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isInteger(n) ? n : null;
};

// Criar
exports.create = (req, res) => {
  const { category, supplier, document, amount, expense_date, description } = req.body;

  if (!category || amount == null || !expense_date) {
    return res.status(400).json({ error: 'Categoria, valor e data são obrigatórios' });
  }

  const amountNum = typeof amount === 'number' ? amount : toNumber(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: 'Valor inválido' });
  }

  OtherExpense.create(
    String(category).trim(),
    supplier ?? null,
    document ?? null,
    amountNum,
    expense_date,
    description ?? null,
    (err, result) => {
      if (err) {
        console.error('Erro ao criar outra despesa:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      return res.status(201).json({ message: 'Despesa criada com sucesso', id: result?.insertId });
    }
  );
};

// Listar todas
exports.getAll = (_req, res) => {
  OtherExpense.findAll((err, rows) => {
    if (err) {
      console.error('Erro ao listar outras despesas:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    return res.json(rows);
  });
};

// Buscar por ID
exports.getById = (req, res) => {
  const id = toInt(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

  OtherExpense.findById(id, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar outra despesa por id:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Registro não encontrado' });
    return res.json(rows[0]);
  });
};

// Buscar por período ?year=YYYY&month=M
exports.getByPeriod = (req, res) => {
  const year = toInt(req.query.year);
  const month = toInt(req.query.month);
  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return res.status(400).json({ error: 'Parâmetros year e month são obrigatórios' });
  }

  OtherExpense.findByPeriod(year, month, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar outras despesas por período:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    return res.json(rows);
  });
};

// Atualizar por ID
exports.update = (req, res) => {
  const id = toInt(req.params.id);
  const { category, supplier, document, amount, expense_date, description } = req.body;

  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });
  if (!category || amount == null || !expense_date) {
    return res.status(400).json({ error: 'Categoria, valor e data são obrigatórios' });
  }

  const amountNum = typeof amount === 'number' ? amount : toNumber(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: 'Valor inválido' });
  }

  OtherExpense.updateById(
    id,
    String(category).trim(),
    supplier ?? null,
    document ?? null,
    amountNum,
    expense_date,
    description ?? null,
    (err, result) => {
      if (err) {
        console.error('Erro ao atualizar outra despesa:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      if (result?.affectedRows === 0) return res.status(404).json({ error: 'Registro não encontrado' });
      return res.json({ message: 'Despesa atualizada com sucesso' });
    }
  );
};

// Excluir por ID
exports.remove = (req, res) => {
  const id = toInt(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

  OtherExpense.deleteById(id, (err, result) => {
    if (err) {
      console.error('Erro ao excluir outra despesa:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (result?.affectedRows === 0) return res.status(404).json({ error: 'Registro não encontrado' });
    return res.json({ message: 'Despesa excluída com sucesso' });
  });
};

// Totais (opcional) ?year=YYYY&month=M
exports.getTotalsByPeriod = (req, res) => {
  const year = toInt(req.query.year);
  const month = toInt(req.query.month);
  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return res.status(400).json({ error: 'Parâmetros year e month são obrigatórios' });
  }

  OtherExpense.sumByPeriod(year, month, (err, rows) => {
    if (err) {
      console.error('Erro ao totalizar outras despesas por período:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    const resp = rows && rows[0] ? rows[0] : { total_other_expenses: 0, total_records: 0 };
    return res.json(resp);
  });
};

// Totais por categoria (opcional)
exports.getTotalsByCategory = (req, res) => {
  const year = toInt(req.query.year);
  const month = toInt(req.query.month);
  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return res.status(400).json({ error: 'Parâmetros year e month são obrigatórios' });
  }

  OtherExpense.sumByCategory(year, month, (err, rows) => {
    if (err) {
      console.error('Erro ao totalizar outras despesas por categoria:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    return res.json(rows || []);
  });
};
